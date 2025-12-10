// src/pages/BulkUploadPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import BulkUploadCard from "../components/BulkUploadCard";
import { LinksList } from "../components/Links";
import { useAuth } from "../context/AuthContext";
import { getLinks, deleteLinkByKey} from "../Api";

function BulkUploadPage() {
  const { token, handleApiError } = useAuth();

  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [linkError, setLinkError] = useState("");

  // helper to reload list from API
  const reloadLinks = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingLinks(true);
      setLinkError("");
      const data = await getLinks(token);
      setLinks(data);
    } catch (err) {
      if (handleApiError && handleApiError(err)) return;
      setLinkError(err.message);
    } finally {
      setLoadingLinks(false);
    }
  }, [token, handleApiError]);

  // initial load
  useEffect(() => {
    if (token) reloadLinks();
  }, [token, reloadLinks]);

  async function handleDeleteLink(link) {
    try {
      setLinkError("");
      const key = link.alias || link.short_code;
      await deleteLinkByKey(key, token);
      await reloadLinks();
    } catch (err) {
      if (handleApiError && handleApiError(err)) return;
      setLinkError(err.message);
    }
  }

  // called once per successful WS item_result ("ok")
  async function handleBulkFinished() {
    await reloadLinks();
  }

  return (
    <div className="bulk-page">
      <BulkUploadCard onFinished={handleBulkFinished} />

      {linkError && <p className="error-text" style={{ marginTop: 8 }}>{linkError}</p>}

      <LinksList
        links={links}
        loading={loadingLinks}
        onDelete={handleDeleteLink}
      />
    </div>
  );
}

export default BulkUploadPage;