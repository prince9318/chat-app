import MessageOptions from "./MessageOptions";

const ChatDeletedBubble = ({
  msg,
  isOwn,
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
      className={`absolute top-2 ${isOwn ? "right-2" : "left-2"} w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 max-md:opacity-90 transition-opacity border border-[var(--border-subtle)] cursor-pointer touch-target z-10`}
      aria-label="Message options"
      onClick={(e) => {
        e.stopPropagation();
        onOpenOptions(msg._id, false);
      }}
    >
      ⋮
    </button>
  </div>
);

export default ChatDeletedBubble;
