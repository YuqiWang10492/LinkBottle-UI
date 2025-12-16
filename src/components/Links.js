import React, { useState } from "react";
import { fetchLinkTitle } from "../Api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function ShortenLinkForm({ onCreate, errorFromLinks }) {
  const { token, handleApiError } = useAuth();
  const navigate = useNavigate();

  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [alias, setAlias] = useState("");
  const [customAlias, setCustomAlias] = useState(false);
  const [generateQr, setGenerateQr] = useState(false);
  const [creating, setCreating] = useState(false);

  const [titleTouched, setTitleTouched] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState(false);
  const [titleError, setTitleError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!originalUrl.trim() || creating) return;

    setCreating(true);
    try {
      await onCreate({
        original_url: originalUrl,
        title: title || null,
        alias: customAlias ? alias || null : null,
        generate_qr: generateQr,
      });

      // keep your existing reset behavior
      setOriginalUrl("");
      setTitle("");
      setAlias("");
      setCustomAlias(false);
      setGenerateQr(false);
      setTitleTouched(false);
      setTitleError("");
    } finally {
      // even if the parent reports an error, unlock the form
      setCreating(false);
    }
  }

  async function handleUrlBlur() {
    if (!token || !originalUrl || (titleTouched && title)) return;

    try {
      setLoadingTitle(true);
      setTitleError("");
      const fetchedTitle = await fetchLinkTitle(originalUrl.trim(), token);
      if (!titleTouched || !title) {
        setTitle(fetchedTitle);
      }
    } catch (err) {
      if (handleApiError && handleApiError(err)) return;
      setTitleError(err.message || "Failed to fetch title");
    } finally {
      setLoadingTitle(false);
    }
  }

  function handleTitleChange(e) {
    if (!titleTouched) setTitleTouched(true);
    setTitle(e.target.value);
  }

  return (
    <section className="card">
      {/* header row with bulk upload button on right */}
      <div className="card-header-row space-between">
        <div className="card-header-main">
          <div className="card-icon">↪</div>
          <div>
            <h2 className="card-title">Shorten Your Link</h2>
            <p className="card-text">
              Paste your long URL and get a short link instantly.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/bulk")}
        >
          Bulk Upload
        </button>
      </div>

      {errorFromLinks && <p className="error-text">{errorFromLinks}</p>}

      <form onSubmit={handleSubmit} className="form">
        <fieldset disabled={creating} style={{ border: "none", padding: 0, margin: 0 }}>
          <label className="form-label">
            Long URL
            <input
              className="input"
              type="url"
              placeholder="https://example.com/very/long/url/path"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              onBlur={handleUrlBlur}
              required
            />
          </label>

          <label className="form-label">
            Title (optional)
            <input
              className="input"
              value={title}
              onChange={handleTitleChange}
              placeholder="Website title (auto-filled if empty)"
            />
            {loadingTitle && (
              <span className="title-fetching-below">Fetching…</span>
            )}
            {titleError && (
              <span className="error-text" style={{ fontSize: "12px" }}>
                {titleError}
              </span>
            )}
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={customAlias}
              onChange={(e) => setCustomAlias(e.target.checked)}
            />
            <span>Customize short link</span>
          </label>

          {customAlias && (
            <label className="form-label">
              Custom alias
              <input
                className="input"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="my-custom-alias"
              />
            </label>
          )}

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={generateQr}
              onChange={(e) => setGenerateQr(e.target.checked)}
            />
            <span>Generate QR code for this link</span>
          </label>
        </fieldset>

        <button
          className="btn-primary"
          type="submit"
          disabled={creating}
        >
          {creating ? "Creating short link…" : "✨ Shorten Link"}
        </button>
      </form>
    </section>
  );
}


function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LinksList({ links, loading, onDelete }) {
  const navigate = useNavigate();

  return (
    <section className="card card-links">
      <h2 className="card-title">Your Short Links</h2>

      {loading ? (
        <p className="card-text">Loading links…</p>
      ) : links.length === 0 ? (
        <p className="card-text">You don’t have any links yet.</p>
      ) : (
        <div className="links-list">
          {links.map((link) => {
            const key = link.alias || link.short_code;

            return (
              <div key={link.id} className="link-item">
                <div className="link-main">
                  <a
                    className="link-short"
                    href={`http://${link.short_url}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {link.short_url}
                  </a>
                  <span className="link-date">
                    {formatDate(link.created_at)}
                  </span>
                </div>

                <div className="link-title-row">
                  <div className="link-title">
                    {link.title || "Untitled Link"}
                  </div>
                  <div className="link-alias">/{key}</div>
                </div>

                <a
                  className="link-original"
                  href={link.original_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.original_url}
                </a>

                <div className="link-meta-row">
                  <span className="link-meta">{link.clicks} clicks</span>
                  <div className="link-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() =>
                        navigate(`/link/${link.id}`, { state: { link } })
                      }
                    >
                      Details
                    </button>
                    {onDelete && (
                      <button
                        className="icon-button icon-button-danger"
                        type="button"
                        onClick={() => onDelete(link)}
                        title="Delete link"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
