import { formatMessageTime, normalizeUrl } from "../lib/utils";

const optionBtnClass =
  "absolute top-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 max-md:opacity-90 cursor-pointer touch-target z-10 transition-opacity border border-[var(--border-subtle)]";

const getLinkHost = (url) => {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./i, "");
  } catch {
    return "Open link";
  }
};

const ChatLinkBubble = ({ msg, link, isOwn, onOpenOptions }) => {
  return (
    <div
      className={`message-card relative inline-block mb-1 group min-w-[12rem] max-w-[min(90%,28rem)] ${
        isOwn ? "text-white" : "text-[var(--text-primary)]"
      }`}
    >
      <a
        href={normalizeUrl(link)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit link: ${getLinkHost(link)}`}
        className={`block rounded-[var(--radius-xl)] px-3 py-3 pr-12 ${
          isOwn
            ? "bg-[var(--sent-bubble)] bubble-sent"
            : "bg-[var(--received-bubble)] bubble-received"
        }`}
      >
        <p className="text-xs uppercase tracking-wide opacity-75">
          Web Preview
        </p>
        <div className="mt-2 flex items-start gap-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isOwn ? "bg-white/12" : "bg-[var(--bg-app)] border border-[var(--border-subtle)]"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 01-5.656-5.656l1.414-1.414m8.486-1.414l1.414-1.414a4 4 0 015.656 5.656l-2 2a4 4 0 01-5.656 0"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-medium break-all">{getLinkHost(link)}</p>
            <p
              className={`text-xs break-all mt-1 ${isOwn ? "text-white/80" : "text-[var(--text-muted)]"}`}
            >
              {link}
            </p>
          </div>
        </div>
      </a>
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
        className={`absolute bottom-2 right-2 text-[11px] leading-none flex items-center gap-0.5 opacity-90 ${isOwn ? "text-white/90" : "text-[var(--text-muted)]"}`}
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

export default ChatLinkBubble;
