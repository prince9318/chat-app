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

const getLinkHost = (url) => {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./i, "");
  } catch {
    return "Open link";
  }
};

const ChatLinkBubble = ({ msg, link, isOwn, isActive = false, onOpenOptions }) => {
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
        className={`absolute top-2 ${isOwn ? "right-2" : "left-2"} w-6 h-6 rounded-full bg-black/45 hover:bg-black/75 text-white/90 backdrop-blur-md flex items-center justify-center text-xs shadow-sm transition-all border-0 cursor-pointer z-10 ${
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
