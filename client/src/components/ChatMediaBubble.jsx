import { formatMessageTime } from "../lib/utils";

const optionBtnClass =
  "absolute top-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 max-md:opacity-90 cursor-pointer touch-target z-10 transition-opacity border border-[var(--border-subtle)]";

const ChatMediaBubble = ({ msg, isOwn, onOpenOptions, onOpenPreview }) => {
  return (
    <div className="relative inline-block mb-6 group">
      {msg.image ? (
        <button
          type="button"
          onClick={() => onOpenPreview(msg.image, "image", "Image preview")}
          aria-label="View full image"
          className="block p-0 border-0 bg-transparent text-left cursor-pointer rounded-[var(--radius-xl)] overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          <img
            src={msg.image}
            alt="Shared attachment"
            className="max-w-[min(85vw,250px)] sm:max-w-[250px] md:max-w-[300px] max-h-[70vh] object-contain shadow-lg rounded-[var(--radius-xl)]"
          />
        </button>
      ) : msg.video ? (
        <video
          controls
          src={msg.video}
          className="max-w-[min(85vw,250px)] sm:max-w-[250px] md:max-w-[300px] max-h-[50vh] rounded-[var(--radius-xl)] shadow-lg"
        >
          <track kind="captions" />
        </video>
      ) : (
        <audio controls src={msg.audio} className="max-w-[240px] h-9">
          <track kind="captions" />
        </audio>
      )}

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

      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-[var(--text-muted)]">
        <span>{formatMessageTime(msg.createdAt)}</span>
        {isOwn && (
          <span className={msg.seen ? "text-blue-400" : "text-[var(--text-muted)]"}>
            ✓✓
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatMediaBubble;
