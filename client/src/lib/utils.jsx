import React from "react";
// ✅ Utility function to format a given date into "HH:MM" (24-hour format)
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit", // always show 2 digits for hours (e.g., 09, 17)
    minute: "2-digit", // always show 2 digits for minutes (e.g., 03, 45)
    hour12: false, // use 24-hour format (e.g., 17:30 instead of 5:30 PM)
  });
}

// ✅ Utility function to detect URLs and convert them to clickable links
export function detectAndConvertURLs(text) {
  if (!text) return text;

  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Split text by URLs and map each part
  return text.split(urlRegex).map((part) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={part}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-300 underline hover:text-purple-200 transition-colors break-keep"
        >
          {part}
        </a>
      );
    }
    const stableKey =
      part.length > 0
        ? `t-${part.length}-${part.slice(0, Math.min(8, part.length)).replace(/\W/g, "x")}-${part.charCodeAt(0) || "x"}`
        : `t-empty`;
    return (
      <span key={stableKey}>
        {part}
      </span>
    );
  });
}
