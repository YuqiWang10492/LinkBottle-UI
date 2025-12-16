// src/pages/LinkDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLinks, generateQrCodePath } from "../Api";

function LinkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, handleApiError } = useAuth();

  const [link, setLink] = useState(location.state?.link || null);
  const [loading, setLoading] = useState(!link);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleGenerateQr() {
    if (!link || !token) return;

    try {
      setBusy(true);
      setError("");

      const key = link.alias || link.short_code;
      const data = await generateQrCodePath(key, token);

      // data might be the full link or just { qr_code_path }
      const qrPath =
        data.qr_code_path ||
        (data.link && data.link.qr_code_path) ||
        null;

      if (!qrPath) {
        setError("QR code path not returned by server.");
        return;
      }

      setLink((prev) => ({
        ...prev,
        qr_code_path: qrPath,
      }));
    } catch (err) {
      if (handleApiError && handleApiError(err)) return;
      setError(err.message || "Failed to generate QR code");
    } finally {
      setBusy(false);
    }
  }

  // Load link if we don't have it (e.g. page refresh)
  useEffect(() => {
    if (link || !token) return;

    async function loadLink() {
      try {
        setLoading(true);
        const list = await getLinks(token);
        const found = list.find((l) => String(l.id) === String(id));
        if (!found) {
          setError("Link not found");
        } else {
          setLink(found);
        }
      } catch (err) {
        if (handleApiError && handleApiError(err)) return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadLink();
  }, [link, token, id, handleApiError]);

  if (loading) {
    return <p className="card-text">Loading link…</p>;
  }

  if (error) {
    return (
      <div className="card">
        <p className="error-text">{error}</p>
        <button className="btn-secondary" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="card">
        <p className="card-text">Link not found.</p>
        <button className="btn-secondary" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="card link-detail-card">
      <button
        className="btn-secondary"
        type="button"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "12px" }}
      >
        ← Back
      </button>

      <h2 className="card-title">Link Details</h2>

      {error && <p className="error-text">{error}</p>}

      <div className="link-detail-grid">
        <div className="link-detail-info">
          {/* existing title/short/original/clicks fields */}
          <p className="card-text">Title: {link.title || "Untitled Link"}</p>
          <p className="card-text">
            Short URL:{" "}
            <a 
              href={`http://${link.short_url}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-url"
            >
              {link.short_url}
            </a>
          </p>
          <p className="card-text">
            Original URL:{" "}
            <a 
              href={link.original_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="link-url"
            >
              {link.original_url}
            </a>
          </p>
          <p className="card-text">
            QR Code Path:{" "}
            {link.qr_code_path ? (
              <a 
                href={link.qr_code_path}
                target="_blank"
                rel="noopener noreferrer"
                className="link-url"
              >
                {link.qr_code_path}
              </a>
            ) : (
              "Not generated"
            )}
          </p>
          <p className="card-text">Clicks: {link.clicks}</p>

        </div>

        <div className="link-detail-qr">
          <div className="qr-large-card">
            {link.qr_code_path ? (
              <img
                src={link.qr_code_path}
                alt="QR code"
                className="qr-large-image"
              />
            ) : (
              <button
                className="btn-primary"
                type="button"
                onClick={handleGenerateQr}
                disabled={busy}
              >
                {busy ? "Generating..." : "Generate QR code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkDetailPage;
