import os
import re
import json
import uuid
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from .models_db import EmailDispatchRecord, utc_now

logger = logging.getLogger(__name__)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def validate_email_address(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def get_active_email_provider() -> Dict[str, Any]:
    resend_key = os.environ.get("RESEND_API_KEY", "").strip()
    resend_from = os.environ.get("RESEND_FROM_EMAIL", "").strip() or "onboarding@resend.dev"
    
    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_pass = os.environ.get("SMTP_PASS", "").strip()
    smtp_port = os.environ.get("SMTP_PORT", "587").strip()

    if resend_key:
        return {
            "provider": "RESEND",
            "configured": True,
            "sender": resend_from,
            "details": "Resend API Integration Active"
        }
    elif smtp_host and smtp_user:
        return {
            "provider": "SMTP",
            "configured": True,
            "sender": smtp_user,
            "details": f"SMTP Host: {smtp_host}:{smtp_port}"
        }
    else:
        return {
            "provider": "NONE",
            "configured": False,
            "sender": "noreply@evoresearch.org",
            "details": "No live credentials found. Set RESEND_API_KEY or SMTP_HOST/SMTP_USER in .env."
        }

def send_email_via_resend(
    api_key: str,
    from_email: str,
    to_email: str,
    subject: str,
    body_text: str,
    html_text: Optional[str] = None,
    idempotency_key: Optional[str] = None
) -> Dict[str, Any]:
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key

    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": subject,
        "text": body_text,
    }
    if html_text:
        payload["html"] = html_text

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            resp_body = resp.read().decode("utf-8")
            result = json.loads(resp_body)
            return {
                "success": True,
                "provider_msg_id": result.get("id", f"resend-{uuid.uuid4().hex[:8]}"),
                "status": "ACCEPTED",
                "response": result
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        logger.error(f"Resend HTTP error {e.code}: {err_msg}")
        return {
            "success": False,
            "status": "FAILED",
            "error": f"Resend API error ({e.code}): {err_msg}"
        }
    except Exception as e:
        logger.error(f"Resend network error: {e}")
        return {
            "success": False,
            "status": "FAILED",
            "error": f"Resend network exception: {str(e)}"
        }

def send_email_via_smtp(
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_pass: str,
    to_email: str,
    subject: str,
    body_text: str
) -> Dict[str, Any]:
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body_text, "plain"))

    try:
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=12)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        return {
            "success": True,
            "provider_msg_id": f"smtp-{uuid.uuid4().hex[:12]}",
            "status": "ACCEPTED",
            "response": {"smtp_host": smtp_host}
        }
    except Exception as e:
        logger.error(f"SMTP dispatch error: {e}")
        return {
            "success": False,
            "status": "FAILED",
            "error": f"SMTP delivery failure: {str(e)}"
        }

def dispatch_email_workflow(
    db: Session,
    recipient_email: str,
    subject: str,
    message_body: str = "",
    report_id: Optional[str] = None,
    template_name: str = "RESEARCH_REPORT",
    confirm_authorized: bool = True,
    idempotency_key: Optional[str] = None,
    allow_mock_fallback: bool = True
) -> Dict[str, Any]:
    # 1. Authorization check
    if not confirm_authorized:
        return {
            "status": "REJECTED_UNAUTHORIZED",
            "error": "Explicit user authorization confirmation required before dispatching external email.",
            "dispatched_live": False
        }

    # 2. Recipient email format validation
    recipient_clean = (recipient_email or "").strip()
    if not validate_email_address(recipient_clean):
        return {
            "status": "INVALID_RECIPIENT",
            "error": f"Invalid recipient email address format: '{recipient_email}'",
            "dispatched_live": False
        }

    # 3. Subject validation
    if not subject or not subject.strip():
        return {
            "status": "INVALID_SUBJECT",
            "error": "Email subject cannot be empty.",
            "dispatched_live": False
        }

    # 4. Idempotency Check (Prevent duplicate sends)
    if idempotency_key:
        existing = db.query(EmailDispatchRecord).filter(EmailDispatchRecord.idempotency_key == idempotency_key).first()
        if existing:
            return {
                "status": existing.status,
                "email_id": existing.email_id,
                "recipient": existing.recipient,
                "subject": existing.subject,
                "provider": existing.provider,
                "provider_msg_id": existing.provider_msg_id,
                "dispatched_live": existing.dispatched_live,
                "idempotent_cached": True,
                "message": "Duplicate submission avoided via idempotency key."
            }

    email_id = f"msg-{uuid.uuid4().hex[:12]}"
    provider_info = get_active_email_provider()

    # Record dispatch attempt in DB
    record = EmailDispatchRecord(
        email_id=email_id,
        recipient=recipient_clean,
        sender=provider_info["sender"],
        subject=subject.strip(),
        message_body=message_body or "",
        template_name=template_name,
        report_id=report_id,
        status="SENDING",
        provider=provider_info["provider"],
        idempotency_key=idempotency_key or f"ik-{uuid.uuid4().hex[:12]}",
        dispatched_live=False
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # If no live provider configured
    if not provider_info["configured"]:
        if allow_mock_fallback:
            record.status = "ACCEPTED"
            record.provider = "MOCK_TEST"
            record.provider_msg_id = f"mock-{uuid.uuid4().hex[:10]}"
            record.dispatched_live = False
            record.delivery_evidence = json.dumps({"note": "Executed in mock mode due to unconfigured API key."})
            db.commit()
            return {
                "status": "ACCEPTED_MOCK",
                "email_id": email_id,
                "recipient": recipient_clean,
                "subject": subject,
                "provider": "MOCK_TEST",
                "provider_msg_id": record.provider_msg_id,
                "dispatched_live": False,
                "message": "Email request accepted in Mock Verification Mode. Set RESEND_API_KEY or SMTP in .env for live transmission."
            }
        else:
            record.status = "CONFIGURATION_REQUIRED"
            record.error_message = provider_info["details"]
            db.commit()
            return {
                "status": "CONFIGURATION_REQUIRED",
                "email_id": email_id,
                "recipient": recipient_clean,
                "subject": subject,
                "provider": "NONE",
                "error": provider_info["details"],
                "dispatched_live": False
            }

    # Execute Live Dispatch
    if provider_info["provider"] == "RESEND":
        api_key = os.environ.get("RESEND_API_KEY", "").strip()
        res = send_email_via_resend(
            api_key=api_key,
            from_email=provider_info["sender"],
            to_email=recipient_clean,
            subject=subject.strip(),
            body_text=message_body or "",
            idempotency_key=record.idempotency_key
        )
    else: # SMTP
        smtp_host = os.environ.get("SMTP_HOST", "").strip()
        smtp_port = int(os.environ.get("SMTP_PORT", "587").strip())
        smtp_user = os.environ.get("SMTP_USER", "").strip()
        smtp_pass = os.environ.get("SMTP_PASS", "").strip()
        res = send_email_via_smtp(
            smtp_host=smtp_host,
            smtp_port=smtp_port,
            smtp_user=smtp_user,
            smtp_pass=smtp_pass,
            to_email=recipient_clean,
            subject=subject.strip(),
            body_text=message_body or ""
        )

    if res.get("success"):
        record.status = "ACCEPTED"
        record.provider_msg_id = res.get("provider_msg_id", "")
        record.dispatched_live = True
        record.delivery_evidence = json.dumps(res.get("response", {}))
        db.commit()
        return {
            "status": "ACCEPTED",
            "email_id": email_id,
            "recipient": recipient_clean,
            "subject": subject,
            "provider": provider_info["provider"],
            "provider_msg_id": record.provider_msg_id,
            "dispatched_live": True
        }
    else:
        record.status = "FAILED"
        record.error_message = res.get("error", "Unknown provider dispatch error.")
        db.commit()
        return {
            "status": "FAILED",
            "email_id": email_id,
            "recipient": recipient_clean,
            "subject": subject,
            "provider": provider_info["provider"],
            "error": record.error_message,
            "dispatched_live": False
        }
