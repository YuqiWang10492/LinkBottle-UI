import React, { useEffect } from "react";
import { useBulkUpload } from "../context/BulkUploadContext";

function NotificationBar() {
  const { notification, clearNotification } = useBulkUpload();

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => {
      clearNotification();
    }, 4000);
    return () => clearTimeout(t);
  }, [notification, clearNotification]);

  if (!notification) return null;

  return (
    <div className="notification-bar">
      <span>{notification.message}</span>
      <button
        type="button"
        onClick={clearNotification}
        className="notification-close"
      >
        ✕
      </button>
    </div>
  );
}

export default NotificationBar;
