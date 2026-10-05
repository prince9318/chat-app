import MessageOptions from "./MessageOptions";

const ChevronDownIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const ChatDeletedBubble = ({
  msg,
  isOwn,
  isActive = false,
  isOptionsOpen,
  onOpenOptions,
  onCloseOptions,
}) => (
  <div className="relative inline-block mb-1 group max-w-[min(85%,22rem)] min-w-[120px]">
    {isOptionsOpen && (
      <MessageOptions
        messageId={msg._id}
        isOwnMessage={false}
        position={!isOwn ? "left" : "right"}
        onClose={onCloseOptions}
      />
    )}
    <p className="p-3 text-[var(--text-muted)] italic bg-[var(--received-bubble)] bubble-received break-normal whitespace-pre-wrap text-sm">
      This message was deleted
    </p>
    <button
      type="button"
      className={`absolute top-2 ${isOwn ? "right-2" : "left-2"} w-6 h-6 rounded-full bg-black/45 hover:bg-black/75 text-white/90 backdrop-blur-md flex items-center justify-center text-xs shadow-sm transition-all border-0 cursor-pointer z-10 ${
        isActive ? "opacity-100 flex" : "opacity-0 md:group-hover:opacity-100 max-md:hidden"
      }`}
      aria-label="Message options"
      onClick={(e) => {
        e.stopPropagation();
        onOpenOptions(msg._id, false);
      }}
    >
      <ChevronDownIcon />
    </button>
  </div>
);

export default ChatDeletedBubble;
