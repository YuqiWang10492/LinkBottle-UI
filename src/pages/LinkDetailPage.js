// src/pages/LinkDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLinks, getLinkQrCode } from "../Api";

function LinkDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, handleApiError } = useAuth();

  const [link, setLink] = useState(location.state?.link || null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loading, setLoading] = useState(!link);
  const [error, setError] = useState("");

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

  // Load QR once we have link
  useEffect(() => {
    if (!link || !token || qrUrl) return;

    async function loadQr() {
      try {
        const key = link.alias || link.short_code;
        const blob = await getLinkQrCode(key, token);
        const objectUrl = URL.createObjectURL(blob);
        setQrUrl(objectUrl);
      } catch (err) {
        if (handleApiError && handleApiError(err)) return;
        setError(err.message);
      }
    }

    loadQr();

    return () => {
      if (qrUrl) URL.revokeObjectURL(qrUrl);
    };
  }, [link, token, qrUrl, handleApiError]);

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

  const key = link.alias || link.short_code;

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
      <p className="card-text">Alias: /{key}</p>

      <div className="link-detail-grid">
        <div className="link-detail-info">
          <p>
            <strong>Title:</strong> {link.title || "Untitled Link"}
          </p>
          <p>
            <strong>Short URL:</strong>{" "}
            <a href={`http://${link.short_url}`} target="_blank" rel="noreferrer">
              {link.short_url}
            </a>
          </p>
          <p>
            <strong>Original URL:</strong>{" "}
            <a href={link.original_url} target="_blank" rel="noreferrer">
              {link.original_url}
            </a>
          </p>
          <p>
            <strong>Clicks:</strong> {link.clicks}
          </p>
        </div>

        <div className="link-detail-qr">
          <div className="qr-large-card">
            {qrUrl ? (
              <img src={qrUrl} alt="QR code" className="qr-large-image" />
            ) : (
              <p className="card-text">Generating QR code…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkDetailPage;
