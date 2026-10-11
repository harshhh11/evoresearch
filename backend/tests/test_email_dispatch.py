import unittest
import os
import json
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.models_db import EmailDispatchRecord
from backend.email_service import (
    validate_email_address,
    get_active_email_provider,
    dispatch_email_workflow
)

class TestEmailDispatchSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(cls.engine)
        cls.SessionLocal = sessionmaker(bind=cls.engine)

    def setUp(self):
        self.db = self.SessionLocal()

    def tearDown(self):
        self.db.close()

    # 1. Valid recipient & message
    def test_valid_email_dispatch_mock(self):
        res = dispatch_email_workflow(
            db=self.db,
            recipient_email="researcher@university.edu",
            subject="Test Research Report",
            message_body="Execution results summary.",
            confirm_authorized=True,
            allow_mock_fallback=True
        )
        self.assertIn(res["status"], ["ACCEPTED", "ACCEPTED_MOCK"])
        self.assertTrue(validate_email_address(res["recipient"]))

    # 2. Invalid recipient format
    def test_invalid_email_format(self):
        res = dispatch_email_workflow(
            db=self.db,
            recipient_email="not-an-email-address",
            subject="Test Report",
            confirm_authorized=True
        )
        self.assertEqual(res["status"], "INVALID_RECIPIENT")
        self.assertIn("Invalid recipient email address format", res["error"])

    # 3. Missing subject
    def test_missing_subject(self):
        res = dispatch_email_workflow(
            db=self.db,
            recipient_email="test@example.com",
            subject="",
            confirm_authorized=True
        )
        self.assertEqual(res["status"], "INVALID_SUBJECT")

    # 4. Unauthorized dispatch attempt
    def test_unauthorized_dispatch(self):
        res = dispatch_email_workflow(
            db=self.db,
            recipient_email="user@domain.com",
            subject="Report",
            confirm_authorized=False
        )
        self.assertEqual(res["status"], "REJECTED_UNAUTHORIZED")

    # 5. Idempotency guard (Duplicate send avoidance)
    def test_idempotency_duplicate_guard(self):
        key = f"ik-test-{uuid.uuid4().hex[:8]}"
        res1 = dispatch_email_workflow(
            db=self.db,
            recipient_email="colleague@lab.org",
            subject="Idempotent Test",
            confirm_authorized=True,
            idempotency_key=key,
            allow_mock_fallback=True
        )
        res2 = dispatch_email_workflow(
            db=self.db,
            recipient_email="colleague@lab.org",
            subject="Idempotent Test",
            confirm_authorized=True,
            idempotency_key=key,
            allow_mock_fallback=True
        )
        self.assertTrue(res2.get("idempotent_cached", False))

    # 6. Email validation helper accuracy
    def test_email_validation_utility(self):
        self.assertTrue(validate_email_address("valid.user+tag@domain.co.uk"))
        self.assertFalse(validate_email_address("plainaddress"))
        self.assertFalse(validate_email_address("@missinguser.com"))
        self.assertFalse(validate_email_address("user@.com"))

    # 7. Database persistence of dispatch record
    def test_db_record_persistence(self):
        res = dispatch_email_workflow(
            db=self.db,
            recipient_email="audit@evoresearch.org",
            subject="Audit Record Test",
            confirm_authorized=True,
            allow_mock_fallback=True
        )
        rec = self.db.query(EmailDispatchRecord).filter(EmailDispatchRecord.email_id == res["email_id"]).first()
        self.assertIsNotNone(rec)
        self.assertEqual(rec.recipient, "audit@evoresearch.org")

if __name__ == "__main__":
    unittest.main()
