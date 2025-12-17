import React, { createContext, useContext, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const BulkUploadContext = createContext(null);

const initialUploadState = {
  inProgress: false,
  processed: 0,
  total: 0,
  successCount: 0,
  failCount: 0,
  lastError: null,
  status: "idle", // "idle" | "uploading" | "finished" | "cancelled" | "error"
};

export function BulkUploadProvider({ children }) {
  const { token } = useAuth();
  const wsRef = useRef(null);

  const [uploadState, setUploadState] = useState(initialUploadState);
  const [notification, setNotification] = useState(null);

   // NEW: a callback that the links page can register
  const refreshLinksCbRef = useRef(null);

  function registerLinksRefreshCallback(cb) {
    refreshLinksCbRef.current = cb;
  }

  function clearNotification() {
    setNotification(null);
  }

  function closeWs() {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
  }

  function resetToIdle() {
    setUploadState(initialUploadState);
  }

  function startBulkUpload(links) {
    if (!token) {
      setUploadState((s) => ({
        ...s,
        lastError: "You must be logged in to upload.",
        status: "error",
      }));
      return;
    }

    // Close any previous socket
    closeWs();

    const total = links.length;

    setUploadState({
      inProgress: true,
      processed: 0,
      total,
      successCount: 0,
      failCount: 0,
      lastError: null,
      status: "uploading",
    });

    const ws = new WebSocket(
      `ws://localhost:8000/ws/batch-upload/?token=${encodeURIComponent(token)}`
    );

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "start", total }));

      links.forEach((link) => {
        ws.send(JSON.stringify({ type: "item", data: link }));
      });

      ws.send(JSON.stringify({ type: "finish" }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "item_result") {
        if (msg.status === "ok") {
          setUploadState((prev) => ({
            ...prev,
            processed: prev.processed + 1,
            successCount: prev.successCount + 1,
          }));
    
        } else {
          setUploadState((prev) => ({
            ...prev,
            processed: prev.processed + 1,
            failCount: prev.failCount + 1,
            lastError: msg.detail ? String(msg.detail) : prev.lastError,
          }));
        }
      }

      if (msg.type === "progress") {
        // If you trust backend progress, you can set processed/total here,
        // but keep counts driven by item_result.
        setUploadState((prev) => ({
          ...prev,
          total: typeof msg.total === "number" ? msg.total : prev.total,
        }));
      }

      if (msg.type === "finished") {
        setUploadState((prev) => {
          const final = {
            ...prev,
            inProgress: false,
            status: "finished",
            processed: typeof msg.processed === "number" ? msg.processed : prev.processed,
            total: typeof msg.total === "number" ? msg.total : prev.total,
          };

          setNotification({
            id: Date.now(),
            message: `Bulk upload finished: ${final.successCount} success, ${final.failCount} failed.`,
          });

          return final;
        });

        // ✅ refresh links list once
        try {
            refreshLinksCbRef.current?.();
        } catch (e) {
            console.warn("refresh links callback failed", e);
        }

        closeWs();
      }

      if (msg.type === "cancelled") {
        setUploadState((prev) => {
          const final = { ...prev, inProgress: false, status: "cancelled" };
          setNotification({
            id: Date.now(),
            message: `Bulk upload cancelled: ${final.successCount} success, ${final.failCount} failed.`,
          });
          return final;
        });

        // ✅ refresh links list once
        try {
            refreshLinksCbRef.current?.();
        } catch (e) {
            console.warn("refresh links callback failed", e);
        }

        closeWs();
      }
    };

    ws.onerror = () => {
      setUploadState((prev) => ({
        ...prev,
        inProgress: false,
        status: "error",
        lastError: "WebSocket error during bulk upload.",
      }));
      setNotification({
        id: Date.now(),
        message: `Bulk upload error: ${uploadState.successCount} success, ${uploadState.failCount} failed.`,
      });
      closeWs();
    };

    ws.onclose = () => {
      wsRef.current = null;
    };

    wsRef.current = ws;
  }

  function cancelBulkUpload() {
    if (!wsRef.current) {
      // Already closed / not started
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({ type: "cancel" })); // 👈 mtype == "cancel"
    } catch {}

    // Immediately mark cancelled client-side (don’t wait on server)
    setUploadState((prev) => {
      const final = { ...prev, inProgress: false, status: "cancelled" };
      setNotification({
        id: Date.now(),
        message: `Bulk upload cancelled: ${final.successCount} success, ${final.failCount} failed.`,
      });
      return final;
    });

    // ✅ refresh links list once
    try {
        refreshLinksCbRef.current?.();
    } catch (e) {
        console.warn("refresh links callback failed", e);
    }
    
    closeWs();
  }

  return (
    <BulkUploadContext.Provider
      value={{
        uploadState,
        startBulkUpload,
        cancelBulkUpload,
        resetToIdle, 
        notification,
        clearNotification,
        registerLinksRefreshCallback,
      }}
    >
      {children}
    </BulkUploadContext.Provider>
  );
}

export function useBulkUpload() {
  const ctx = useContext(BulkUploadContext);
  if (!ctx) throw new Error("useBulkUpload must be used within BulkUploadProvider");
  return ctx;
}
