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

export async function createShortLink({ original_url, title, alias, generate_qr }, token) {
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
      generate_qr: !!generate_qr,
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

export async function generateQrCodePath(key, token) {
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
    let message = "Failed to generate QR code";
    try {
      const data = await response.json();
      if (data.detail) message = data.detail;
    } catch {}
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  // Either full link or at least { qr_code_path: "..." }
  return response.json();
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

// Get OTP code (for now, backend also returns the code in JSON)
export async function requestOtp(email) {
  const params = new URLSearchParams({ email });

  const response = await fetch(
    `${API_BASE_URL}/auth/otp/get-code/?${params.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    let message = "Failed to request OTP code";
    try {
      const data = await response.json();
      if (data.detail) message = data.detail;
    } catch {}
    throw buildError(response, message);
  }

  return response.json(); // { detail, code }
}

// Create user
export async function createUser(body) {
  const response = await fetch(`${API_BASE_URL}/auth/create_user/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = "Failed to create account";
    try {
      const data = await response.json();
      if (data.detail) message = data.detail;
    } catch {}
    throw buildError(response, message);
  }

  // Body is just "User Created"; we don't actually need it
  return response.text();
}

export async function changePassword({ old_password, new_password, otp }, token) {
  const payload = {
    new_password,
    otp,
  };

  // Only include old_password if provided (and needed)
  if (old_password) {
    payload.old_password = old_password;
  }

  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Failed to change password";
    try {
      const data = await response.json();
      if (data.detail) message = data.detail;
    } catch {}
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  // returns "Password Changed"
  return response.text();
}

export async function forgetPassword({ email, new_password, otp }) {
  const params = new URLSearchParams({ email });

  const response = await fetch(
    `${API_BASE_URL}/auth/forget-password?${params.toString()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // ChangePasswordRequest body
        new_password,
        otp,
        // old_password is *not* sent in forget-flow
      }),
    }
  );

  if (!response.ok) {
    let message = "Failed to reset password";
    try {
      const data = await response.json();
      if (data.detail) message = data.detail;
    } catch {}
    const err = new Error(message);
    err.status = response.status;
    return Promise.reject(err);
  }

  // returns "Password Changed"
  return response.text();
}
