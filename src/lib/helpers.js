export function parseJwt(token) {
  if (!token) {
    return null;
  }
  const base64Url = token.split(".")[1];
  if (!base64Url) {
    return null;
  }
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function handleLogError(error) {
  if (error.response) {
    console.log(error.response.data);
  } else if (error.request) {
    console.log(error.request);
  } else {
    console.log(error.message);
  }
}

export function getErrorMessage(error, fallback) {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (typeof data === "string" && data.length > 0) {
      return data;
    }
    if (data.message) {
      return data.message;
    }
    if (data.error) {
      return data.error;
    }
  }
  return fallback;
}
