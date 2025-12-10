// Adjust to match your backend host/port:
const WS_BASE_URL = "ws://localhost:8000"; 
// e.g. "wss://your-host.com" in production

export function startBatchUpload({
  links,
  token,
  onItemResult,
  onProgress,
  onFinished,
  onError,
}) {
  const wsUrl =
    `${WS_BASE_URL}/ws/batch-upload/?token=${encodeURIComponent(token)}`;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "start", total: links.length }));

    links.forEach((link) => {
      ws.send(
        JSON.stringify({
          type: "item",
          data: link,
        })
      );
    });

    ws.send(JSON.stringify({ type: "finish" }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (msg.type === "item_result" && onItemResult) {
        onItemResult(msg); // ✅ Dashboard decides what to do
      } else if (msg.type === "progress" && onProgress) {
        onProgress(msg);
      } else if (msg.type === "finished" && onFinished) {
        onFinished(msg);
      }
    } catch (err) {
      console.error("Error parsing WS message", err);
    }
  };

  ws.onerror = (event) => {
    console.error("WebSocket error", event);
    if (onError) onError(event);
  };

  ws.onclose = () => {
    console.log("Batch upload WebSocket closed");
  };

  return ws;
}