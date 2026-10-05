import {
  formatFileSize,
  formatMessageTime,
  getFileTypeLabel,
} from "../lib/utils";

const optionBtnClass =
  "absolute top-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 max-md:opacity-90 cursor-pointer touch-target z-10 transition-opacity border border-[var(--border-subtle)]";

const getPreviewType = (file) => {
  const mimeType = String(file?.mimeType || "").toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "pdf";
  return "file";
};

const ChatFileBubble = ({ msg, isOwn, onOpenOptions, onOpenPreview }) => {
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
