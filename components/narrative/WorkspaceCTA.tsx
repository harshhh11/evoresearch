"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function WorkspaceCTA() {
  const [notice, setNotice] = useState(false);
  return (
    <div className="workspace-actions">
      <motion.button
        className="button button--primary"
        type="button"
        onClick={() => setNotice(true)}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.985 }}
        aria-describedby={notice ? "workspace-notice" : undefined}
      >
        OPEN RESEARCH WORKSPACE <span aria-hidden="true">↗</span>
      </motion.button>
      <a className="button button--quiet" href="#methodology">EXPLORE THE METHODOLOGY <span aria-hidden="true">↓</span></a>
      {notice && (
        <p className="workspace-notice" id="workspace-notice" role="status">
          This preview is a frontend demonstration; a live workspace destination has not been configured.
        </p>
      )}
    </div>
  );
}
