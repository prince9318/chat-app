import { formatMessageTime, normalizeUrl } from "../lib/utils";

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const renderTextWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = String(text || "").split(urlRegex);

  return parts.map((part) => {
    const isLink = /^(https?:\/\/|www\.)/i.test(part);
    if (!isLink) {
      const prefix = part.slice(0, Math.min(8, part.length)).replace(/\W/g, "x");
      const partId = `${part.length}-${prefix}-${part.charCodeAt(0) || "x"}`;
      return <span key={`txt-${partId}`}>{part}</span>;
    }
    return (
      <a
        key={part}
        href={normalizeUrl(part)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline message-link break-all"
      >
        {part}
      </a>
    );
  });
};

const ChatTextBubble = ({ msg, isOwn, isActive = false, onOpenOptions }) => {
  return (
    <div className="relative inline-block mb-1 group min-w-[7rem] max-w-[min(90%,28rem)]">
      <p
        className={`message-bubble p-2 pl-3 pr-12 pb-1 pt-2 text-sm ${
          isOwn
            ? "bg-[var(--sent-bubble)] text-white bubble-sent"
            : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
        }`}
      >
        {renderTextWithLinks(msg.text)}
      </p>
      <button
        type="button"
        className={`absolute top-1.5 ${isOwn ? "right-1.5" : "left-1.5"} w-6 h-6 rounded-full bg-black/45 hover:bg-black/75 text-white/90 backdrop-blur-md flex items-center justify-center text-xs shadow-sm transition-all border-0 cursor-pointer z-10 ${
          isActive ? "opacity-100 flex" : "opacity-0 md:group-hover:opacity-100 max-md:hidden"
        }`}
        aria-label="Message options"
        onClick={(e) => {
          e.stopPropagation();
          onOpenOptions(msg._id, isOwn);
        }}
      >
        <ChevronDownIcon />
      </button>
      <div
        className={`absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-0.5 opacity-90 ${isOwn ? "text-white/90" : "text-[var(--text-muted)]"}`}
      >
        <span>{formatMessageTime(msg.createdAt)}</span>
        {isOwn && (
          <span
            className={msg.seen ? "text-white" : "text-white/70"}
            style={{ marginLeft: "2px" }}
          >
            ✓✓
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatTextBubble;
