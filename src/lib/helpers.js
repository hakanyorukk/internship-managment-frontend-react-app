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
    // validation errors come as { message: "Validation failed", details: ["title: Title is required", ...] }
    if (data.details && data.details.length > 0) {
      return `${data.message}: ${data.details.join(", ")}`;
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

// "UNDER_REVIEW" -> "Under review"
export function formatEnum(value) {
  if (!value) {
    return "";
  }
  const lower = value.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// "2026-09-14" or "2026-09-14T10:22:33" -> "14 Sep 2026"
export function formatDate(value) {
  if (!value) {
    return "";
  }
  // a date without time is read as local midnight, so it never shifts a day
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
