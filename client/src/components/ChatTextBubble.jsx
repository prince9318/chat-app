import { formatMessageTime, normalizeUrl } from "../lib/utils";

const optionBtnClass =
  "absolute top-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 max-md:opacity-90 cursor-pointer touch-target z-10 transition-opacity border border-[var(--border-subtle)]";

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

const ChatTextBubble = ({ msg, isOwn, onOpenOptions }) => {
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
        className={`${optionBtnClass} ${isOwn ? "right-2" : "left-2"}`}
        aria-label="Message options"
        onClick={(e) => {
          e.stopPropagation();
          onOpenOptions(msg._id, isOwn);
        }}
      >
        ⋮
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
