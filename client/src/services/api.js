const rawUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = rawUrl.endsWith("/api")
  ? rawUrl.replace(/\/+$/, "")
  : `${rawUrl.replace(/\/+$/, "")}/api`;

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${API_BASE_URL}/${endpoint.replace(/^\/+/, "")}`;

  const headers = { ...options.headers };

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("authToken")
      : null;

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body && typeof body === "object" && !isFormData) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const config = {
    ...options,
    headers,
    body,
  };

  try {
    const response = await fetch(url, config);

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const errorMessage =
        (data && data.message) ||
        (data && data.error) ||
        `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error [${options.method || "GET"} ${url}]:`, error.message);
    throw error;
  }
}

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "GET" }),

  post: (endpoint, data, options = {}) =>
    request(endpoint, { ...options, method: "POST", body: data }),

  put: (endpoint, data, options = {}) =>
    request(endpoint, { ...options, method: "PUT", body: data }),

  patch: (endpoint, data, options = {}) =>
    request(endpoint, { ...options, method: "PATCH", body: data }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: "DELETE" }),
};

export const apiClient = api;
export default api;
