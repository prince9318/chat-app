import { memo, useRef, useState } from "react";
import { extractUrls } from "../lib/utils";
import MessageOptions from "./MessageOptions";
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
    const [isActive, setIsActive] = useState(false);
    const longPressTimer = useRef(null);
    const touchStartPos = useRef({ x: 0, y: 0 });

    const isOwn = String(msg.senderId) === String(currentUserId);
    const deletedForMe =
      Array.isArray(msg.deletedFor) &&
      msg.deletedFor.some((id) => String(id) === String(currentUserId));
    if (deletedForMe) return null;

    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      longPressTimer.current = setTimeout(() => {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate(35);
        }
        onOpenOptions(msg._id, isOwn);
      }, 450);
    };

    const handleTouchMove = (e) => {
      if (!longPressTimer.current || !e.touches || e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleTouchEnd = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      onOpenOptions(msg._id, isOwn);
    };

    const handleBubbleClick = () => {
      // Toggle active options button for this specific bubble on mobile
      setIsActive((prev) => !prev);
    };

    if (msg.isDeleted) {
      return (
        <div
          className="relative inline-block select-text"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onContextMenu={handleContextMenu}
          onClick={handleBubbleClick}
        >
          <ChatDeletedBubble
            msg={msg}
            isOwn={isOwn}
            isActive={isActive}
            isOptionsOpen={isOptionsOpen}
            onOpenOptions={onOpenOptions}
            onCloseOptions={onCloseOptions}
          />
        </div>
      );
    }

    if (msg.messageType === "call") {
      return <ChatCallBubble msg={msg} isOwn={isOwn} />;
    }

    const singleLink = getSingleLink(msg.text);

    return (
      <div
        className="relative inline-block select-text"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={handleContextMenu}
        onClick={handleBubbleClick}
      >
        {isOptionsOpen && (
          <MessageOptions
            messageId={msg._id}
            isOwnMessage={isOwn}
            onClose={onCloseOptions}
          />
        )}
        {msg.image || msg.video || msg.audio ? (
          <ChatMediaBubble
            msg={msg}
            isOwn={isOwn}
            isActive={isActive}
            onOpenOptions={onOpenOptions}
            onOpenPreview={onOpenPreview}
          />
        ) : msg.file?.url ? (
          <ChatFileBubble
            msg={msg}
            isOwn={isOwn}
            isActive={isActive}
            onOpenOptions={onOpenOptions}
            onOpenPreview={onOpenPreview}
          />
        ) : singleLink ? (
          <ChatLinkBubble
            msg={msg}
            link={singleLink}
            isOwn={isOwn}
            isActive={isActive}
            onOpenOptions={onOpenOptions}
          />
        ) : (
          <ChatTextBubble
            msg={msg}
            isOwn={isOwn}
            isActive={isActive}
            onOpenOptions={onOpenOptions}
          />
        )}
      </div>
    );
  },
);

ChatMessageItem.displayName = "ChatMessageItem";

export default ChatMessageItem;
