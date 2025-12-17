import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBulkUpload } from "../context/BulkUploadContext";

function BulkUploadCard() {
  const { token } = useAuth();
  const { uploadState, startBulkUpload, cancelBulkUpload, resetToIdle } = useBulkUpload();

  const [bulkText, setBulkText] = useState("");
  const [localError, setLocalError] = useState("");

  const { inProgress, processed, total, successCount, failCount, status } = uploadState;

  // When finished or cancelled, revert the card back to form mode
  useEffect(() => {
    if (status === "finished" || status === "cancelled") {
      // Decide whether to clear textarea:
      // - Clear only if all succeeded
      if (status === "finished" && total > 0 && failCount === 0) {
        setBulkText("");
      }
      // Clear local error and reset the global state back to idle
      setLocalError("");
      resetToIdle();
    }
  }, [status, total, failCount, resetToIdle]);

  function parseLines(text) {
    // same parsing you already use; example CSV-ish: url, alias(optional), title(optional)
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [original_url, alias, title] = line.split(",").map((s) => s.trim());
        return {
          original_url,
          alias: alias || null,
          title: title || null,
        };
      });
  }

  function handleStart() {
    if (!token) {
      setLocalError("You must be logged in to upload.");
      return;
    }
    const links = parseLines(bulkText);
    if (links.length === 0) {
      setLocalError("Please enter at least one line.");
      return;
    }
    setLocalError("");
    startBulkUpload(links);
  }

  // Uploading view
  if (inProgress) {
    const pct = total ? Math.round((processed / total) * 100) : 0;

    return (
      <section className="card">
        <h2 className="card-title">Bulk Upload</h2>
        <p className="card-text">Uploading…</p>

        <div style={{ marginTop: 12 }}>
          <div className="card-text">
            Progress: {processed} / {total} ({pct}%)
          </div>
          <div className="card-text" style={{ marginTop: 6 }}>
            Success: {successCount} · Failed: {failCount}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn-secondary" type="button" onClick={cancelBulkUpload}>
            Cancel upload
          </button>
        </div>
      </section>
    );
  }

  // Normal form view
  return (
    <section className="card">
      <h2 className="card-title">Bulk Upload Links</h2>
      <p className="card-text">
        One per line: <code>url, alias(optional), title(optional)</code>
      </p>

      {localError && <p className="error-text">{localError}</p>}

      <textarea
        className="input"
        rows={5}
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        placeholder={
          "https://example.com/page, my-alias, Example Page, 1/0 (generate QR/don't generate)\n" +
          "https://another.com, , Another Site, 0\n" +
          "https://yetanother.com"
        }
      />

      <button className="btn-primary" type="button" onClick={handleStart} style={{ marginTop: 10 }}>
        Start Bulk Upload
      </button>
    </section>
  );
}

export default BulkUploadCard;
