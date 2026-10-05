import {
  formatFileSize,
  formatMessageTime,
  getFileTypeLabel,
} from "../lib/utils";

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const getPreviewType = (file) => {
  const mimeType = String(file?.mimeType || "").toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "pdf";
  return "file";
};

const ChatFileBubble = ({ msg, isOwn, isActive = false, onOpenOptions, onOpenPreview }) => {
  return (
    <div
      className={`message-card relative inline-flex items-start gap-3 min-w-[15rem] max-w-[min(90vw,24rem)] rounded-[var(--radius-xl)] px-3 py-3 mb-1 group ${
        isOwn
          ? "bg-[var(--sent-bubble)] text-white bubble-sent"
          : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm ${
          isOwn
            ? "bg-white/12 text-white border border-white/10"
            : "bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
        }`}
      >
        {getFileTypeLabel(msg.file)}
      </div>
      <div className="min-w-0 flex-1 pr-10">
        <a
          href={msg.file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block font-medium break-words underline-offset-2 hover:underline"
        >
          {msg.file.name || "Attachment"}
        </a>
        <p
          className={`text-xs mt-1 ${isOwn ? "text-white/80" : "text-[var(--text-muted)]"}`}
        >
          {formatFileSize(msg.file.size)}
          {msg.file.mimeType ? ` • ${msg.file.mimeType}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={msg.file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16"
              />
            </svg>
            Open file
          </a>
          <button
            type="button"
            onClick={() =>
              onOpenPreview(
                msg.file.url,
                getPreviewType(msg.file),
                msg.file.name || "Attachment preview",
              )
            }
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
          >
            Preview
          </button>
        </div>
      </div>
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
        className={`absolute bottom-2 right-3 text-[11px] leading-none flex items-center gap-0.5 opacity-90 ${isOwn ? "text-white/90" : "text-[var(--text-muted)]"}`}
      >
        <span>{formatMessageTime(msg.createdAt)}</span>
        {isOwn && (
          <span
            className={msg.seen ? "text-blue-400" : "text-[var(--text-muted)]"}
            style={{ marginLeft: "2px" }}
          >
            ✓✓
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatFileBubble;
