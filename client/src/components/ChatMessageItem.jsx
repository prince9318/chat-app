import { memo } from "react";
import { extractUrls } from "../lib/utils";
import ChatDeletedBubble from "./ChatDeletedBubble";
import ChatCallBubble from "./ChatCallBubble";
import ChatMediaBubble from "./ChatMediaBubble";
import ChatFileBubble from "./ChatFileBubble";
import ChatLinkBubble from "./ChatLinkBubble";
import ChatTextBubble from "./ChatTextBubble";

const getSingleLink = (text) => {
  const links = extractUrls(text);
  if (links.length !== 1) return null;
  return String(text || "").trim() === links[0] ? links[0] : null;
};

const ChatMessageItem = memo(
  ({
    msg,
    currentUserId,
    isOptionsOpen,
    onOpenOptions,
    onCloseOptions,
    onOpenPreview,
  }) => {
    const isOwn = msg.senderId === currentUserId;
    const deletedForMe =
      Array.isArray(msg.deletedFor) && msg.deletedFor.includes(currentUserId);
    if (deletedForMe) return null;

    if (msg.isDeleted) {
      return (
        <ChatDeletedBubble
          msg={msg}
          isOwn={isOwn}
          isOptionsOpen={isOptionsOpen}
          onOpenOptions={onOpenOptions}
          onCloseOptions={onCloseOptions}
        />
      );
    }

    if (msg.messageType === "call") {
      return <ChatCallBubble msg={msg} isOwn={isOwn} />;
    }

    const singleLink = getSingleLink(msg.text);

    return (
      <div className="relative inline-block">
        {msg.image || msg.video || msg.audio ? (
          <ChatMediaBubble
            msg={msg}
            isOwn={isOwn}
            onOpenOptions={onOpenOptions}
            onOpenPreview={onOpenPreview}
          />
        ) : msg.file?.url ? (
          <ChatFileBubble
            msg={msg}
            isOwn={isOwn}
            onOpenOptions={onOpenOptions}
            onOpenPreview={onOpenPreview}
          />
        ) : singleLink ? (
          <ChatLinkBubble
            msg={msg}
            link={singleLink}
            isOwn={isOwn}
            onOpenOptions={onOpenOptions}
          />
        ) : (
          <ChatTextBubble
            msg={msg}
            isOwn={isOwn}
            onOpenOptions={onOpenOptions}
          />
        )}
      </div>
    );
  },
);

ChatMessageItem.displayName = "ChatMessageItem";

export default ChatMessageItem;
