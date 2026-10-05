import { formatMessageTime } from "../lib/utils";

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const ChatMediaBubble = ({ msg, isOwn, isActive = false, onOpenOptions, onOpenPreview }) => {
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
        className={`absolute top-2 ${isOwn ? "right-2" : "left-2"} w-6 h-6 rounded-full bg-black/55 hover:bg-black/80 text-white/95 backdrop-blur-md flex items-center justify-center text-xs shadow-md transition-all border-0 cursor-pointer z-10 ${
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
