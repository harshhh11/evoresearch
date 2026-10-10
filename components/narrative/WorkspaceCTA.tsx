"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function WorkspaceCTA() {
  return (
    <div className="workspace-actions">
      <Link href="/workspace" className="button button--primary">
        OPEN RESEARCH WORKSPACE <span aria-hidden="true">↗</span>
      </Link>
      <a className="button button--quiet" href="#methodology">EXPLORE THE METHODOLOGY <span aria-hidden="true">↓</span></a>
    </div>
  );
}
