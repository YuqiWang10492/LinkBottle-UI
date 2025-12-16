import React, { useRef, useState } from "react";
import { startBatchUpload } from "../wsBatchUpload";
import { useAuth } from "../context/AuthContext";

function BulkUploadCard({ onFinished }) {
  const { token } = useAuth();
  const [bulkText, setBulkText] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const wsRef = useRef(null);

  function parseLines(text) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [original_url, alias, title, generate_qr] = line.split(",").map((s) => s.trim());
        return {
          original_url,
          alias: alias || null,
          title: title || null,
          generate_qr: generate_qr === "1" || generate_qr === "true",
        };
      });
  }

  function handleStart() {
    if (!token) {
      setError("You must be logged in to upload.");
      return;
    }

    const links = parseLines(bulkText);
    if (links.length === 0) {
      setError("Please enter at least one line.");
      return;
    }

    setError("");
    setInProgress(true);
    setProcessed(0);
    setTotal(links.length);

    const ws = startBatchUpload({
      links,
      token,
      onItemResult: (msg) => {
        // msg.status === "ok" from your backend
        if (msg.status === "ok") {
          setProcessed((prev) => prev + 1);
        }
      },
      onProgress: (msg) => {
        if (typeof msg.processed === "number") setProcessed(msg.processed);
        if (typeof msg.total === "number") setTotal(msg.total);
      },
      onFinished: () => {
        setInProgress(false);
        wsRef.current = null;
        setProcessed((prevProcessed) => {
          if (prevProcessed === links.length) {
            setBulkText("");
          }
          return prevProcessed;
        });
        onFinished()// ✅ reload list in Dashboard
      },
      onError: () => {
        setError("WebSocket error during bulk upload.");
        setInProgress(false);
        wsRef.current = null;
        onFinished()// ✅ reload list in Dashboard
      },
    });

    wsRef.current = ws;
  }

  return (
    <section className="card">
      <div className="card-header-row">
        <div className="card-icon">📥</div>
        <div>
          <h2 className="card-title">Bulk Upload Links</h2>
          <p className="card-text">
            One link per line: <code>url, alias(optional), title(optional)</code>
          </p>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="bulk-upload-container">
        <textarea
          className="input"
          rows={5}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
        />
        <button
          type="button"
          className="btn-primary"
          onClick={handleStart}
          disabled={inProgress}
        >
          {inProgress ? "Uploading..." : "Start Bulk Upload"}
        </button>
        {inProgress && (
          <p className="card-text">
            Progress: {processed} / {total}
          </p>
        )}
      </div>
    </section>
  );
}

export default BulkUploadCard;