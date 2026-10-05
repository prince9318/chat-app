import { formatCallDuration, formatMessageTime } from "../lib/utils";

const ChatCallBubble = ({ msg, isOwn }) => {
  const isVideo = msg.callType === "video";
  const isMissed = msg.callStatus === "missed";
  const durationStr = formatCallDuration(msg.callDuration);
  const label = isMissed
    ? `Missed ${isVideo ? "video" : "voice"} call`
    : `${isVideo ? "Video" : "Voice"} call${durationStr ? ` · ${durationStr}` : ""}`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] text-sm ${
        isOwn
          ? "bg-[var(--sent-bubble)] text-white bubble-sent"
          : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
      }`}
    >
      {isVideo ? (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      )}
      <span>{label}</span>
      <span className="text-[11px] opacity-90 ml-1">
        {formatMessageTime(msg.createdAt)}
      </span>
    </div>
  );
};

export default ChatCallBubble;
