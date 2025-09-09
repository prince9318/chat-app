// ✅ Utility function to format a given date into "HH:MM" (24-hour format)
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit", // always show 2 digits for hours (e.g., 09, 17)
    minute: "2-digit", // always show 2 digits for minutes (e.g., 03, 45)
    hour12: false, // use 24-hour format (e.g., 17:30 instead of 5:30 PM)
  });
}
