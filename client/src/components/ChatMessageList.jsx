import { Fragment } from "react";
import ChatMessageItem from "./ChatMessageItem";

const toLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(d, today)) return "Today";
  if (same(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-GB");
};

const ChatMessageList = ({
  messages,
  currentUserId,
  messageOptionsState,
  onOpenOptions,
  onCloseOptions,
  onOpenPreview,
  messagesRef,
  scrollEndRef,
  currentDateLabel,
}) => {
  return (
    <div
      ref={messagesRef}
      className="flex-1 min-h-0 flex flex-col overflow-y-auto px-3 py-1 chat-wallpaper messages-scroll"
    >
      <div className="sticky top-0 z-10 flex justify-center pointer-events-none py-2">
        {currentDateLabel && (
          <span className="date-chip text-xs">{currentDateLabel}</span>
        )}
      </div>
      {messages.map((msg, index) => {
        const showDate =
          index === 0 ||
          (messages[index - 1] &&
            new Date(messages[index - 1].createdAt).toDateString() !==
              new Date(msg.createdAt).toDateString());
        const label = toLabel(msg.createdAt);
        const fragFallback = `msg-frag-${msg.createdAt}-${(
          msg.text ||
          (msg.image || msg.video || msg.audio || msg.file?.url || "")
        ).slice(0, 12)}`;

        return (
          <Fragment key={msg._id || fragFallback}>
            {showDate && (
              <div
                className="date-marker w-full flex justify-center my-4"
                data-date-label={label}
              >
                {currentDateLabel !== label && (
                  <span className="date-chip text-xs">{label}</span>
                )}
              </div>
            )}
            <div
              className={`w-full flex items-end gap-2 ${
                msg.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <ChatMessageItem
                msg={msg}
                currentUserId={currentUserId}
                isOptionsOpen={
                  messageOptionsState.isOpen &&
                  messageOptionsState.messageId === msg._id
                }
                onOpenOptions={onOpenOptions}
                onCloseOptions={onCloseOptions}
                onOpenPreview={onOpenPreview}
              />
            </div>
          </Fragment>
        );
      })}
      <div ref={scrollEndRef} />
    </div>
  );
};

export default ChatMessageList;
