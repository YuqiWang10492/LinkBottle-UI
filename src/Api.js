// api.js
import { API_BASE_URL } from "./config";

function buildError(response, fallbackMessage) {
  const err = new Error(fallbackMessage);
  err.status = response.status; // 👈 important
  return err;
}

// Login and get access token
export async function login(username, password) {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    // 401 from your `HTTPException`
    const errorData = await response.json().catch(() => ({}));
    throw buildError(response, errorData.detail || "Login failed");
  }

  const data = await response.json();
  // data should look like { access_token: '...', token_type: 'bearer' }
  return data;
}

// Example for calling a protected endpoint that uses get_current_user
export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/user/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw buildError(response, errorData.detail || "Failed to fetch current user");
  }

  return response.json();
}

export async function createShortLink({ original_url, title, alias }, token) {
  const response = await fetch(`${API_BASE_URL}/shorten/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      original_url,
      title: title || null,
      alias: alias || null,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw buildError(response, errorData.detail || "Failed to shorten link");
  }

  // returns one link object like in your example
  return response.json();
}

// 🔹 NEW: fetch all links for the current user
export async function getLinks(token) {
  const response = await fetch(`${API_BASE_URL}/links`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw buildError(response, errorData.detail || "Failed to load links");
  }

  // returns an array of link objects
  return response.json();
}

export async function deleteLinkByKey(key, token) {
  // `key` can be the short_url like "localhost:8000/3zKxKJ"
  const params = new URLSearchParams({ key });

  const response = await fetch(`${API_BASE_URL}/by_key/?${params.toString()}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw buildError(response, errorData.detail || "Failed to delete link");
  }

  // endpoint returns "Link deleted" on success
  return response.text();
}

// Get QR code image as a Blob
export async function getLinkQrCode(key, token) {
  const params = new URLSearchParams({ key });

  const response = await fetch(
    `${API_BASE_URL}/links/qrcode/?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw buildError(response, errorData.detail || "Failed to get QR code");
  }

  const blob = await response.blob(); // image/png
  return blob;
}

// Fetch website title for a given URL
export async function fetchLinkTitle(url, token) {
  const params = new URLSearchParams({ url });

  const response = await fetch(
    `${API_BASE_URL}/link/title/?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    // your backend returns plain text on error too, but play safe
    const text = await response.text().catch(() => "Failed to Fetch Title");
    throw buildError(response, text || "Failed to Fetch Title");
  }

  // Backend returns plain text (no JSON), so:
  const title = await response.text();
  return title;
}

// Google OAuth: complete signup
export async function oauthCompleteSignup(pendingToken, username) {
  const response = await fetch(`${API_BASE_URL}/auth/complete-signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pending_token: pendingToken,
      username,
    }),
  });

  if (!response.ok) {
    let msg = "Failed to complete signup";
    try {
      const data = await response.json();
      if (data.detail) msg = data.detail;
    } catch {}
    throw buildError(response, msg);
  }

  return response.json(); // { access_token, token_type }
}

// Google OAuth: bind to existing account
export async function oauthBindAccount(pendingToken, password) {
  const response = await fetch(`${API_BASE_URL}/auth/bind-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pending_token: pendingToken,
      password,
    }),
  });

  if (!response.ok) {
    let msg = "Failed to bind account";
    try {
      const data = await response.json();
      if (data.detail) msg = data.detail;
    } catch {}
    throw buildError(response, msg);
  }

  return response.json(); // { access_token, token_type }
}