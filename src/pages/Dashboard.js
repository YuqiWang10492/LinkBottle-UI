import React, { useEffect, useState, useCallback } from "react";
import {ShortenLinkForm, LinksList} from "../components/Links";
import { useAuth } from "../context/AuthContext";
import { getLinks, createShortLink, deleteLinkByKey} from "../Api";
import { useBulkUpload } from "../context/BulkUploadContext";

export default function Dashboard() {
  const { token, handleApiError } = useAuth();
  const [links, setLinks] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [linkError, setLinkError] = useState("");
  const { registerLinksRefreshCallback } = useBulkUpload();

  // -------- helper: always fetch list from API --------
  const reloadLinks = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingLinks(true);
      const data = await getLinks(token);
      setLinks(data);
    } catch (err) {
      if (handleApiError(err)) return;
      setLinkError(err.message);
    } finally {
      setLoadingLinks(false);
    }
  }, [token, handleApiError]);
  
  useEffect(() => {
    // register (and update) callback
    registerLinksRefreshCallback(reloadLinks);
  }, [registerLinksRefreshCallback, reloadLinks]);

  // initial load / token change
  useEffect(() => {
    if (token) {
      reloadLinks();
    }
  }, [token, reloadLinks]);

  // -------- single create from ShortenLinkForm --------
  async function handleCreateLink(linkInput) {
    try {
      setLinkError("");
      await createShortLink(linkInput, token); // ignore returned link
      await reloadLinks();                      // ✅ get full, correct data
    } catch (err) {
      if (handleApiError(err)) return;
      setLinkError(err.message);
    }
  }

  // -------- delete still uses local update --------
  async function handleDeleteLink(link) {
    try {
      setLinkError("");
      const key = link.alias || link.short_code;
      await deleteLinkByKey(key, token);
      await reloadLinks(); // or keep local filter; up to you
    } catch (err) {
      if (handleApiError(err)) return;
      setLinkError(err.message);
    }
  }

  return (
    <div className="app">
      <div className="shell">
        <ShortenLinkForm
          onCreate={handleCreateLink}
          errorFromLinks={linkError}
        />
        <LinksList
          links={links}
          loading={loadingLinks}
          onDelete={handleDeleteLink}
        />
      </div>
    </div>
  );
}

