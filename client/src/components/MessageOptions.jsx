import { useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";

const MessageOptions = ({ messageId, isOwnMessage, onClose }) => {
  const { deleteMessage } = useContext(ChatContext);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleDeleteForMe = () => {
    deleteMessage(messageId, "me");
    onClose();
  };

  const handleDeleteForEveryone = () => {
    deleteMessage(messageId, "everyone");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-6 text-[var(--text-primary)] shadow-[var(--shadow-modal)]">
        <p className="text-base font-medium mb-4">Delete message?</p>
        <div className="flex flex-col gap-2">
          {isOwnMessage && (
            <button
              type="button"
              onClick={handleDeleteForEveryone}
              className="py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm transition-colors border border-[var(--border-subtle)]"
            >
              Delete for everyone
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteForMe}
            className="py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm transition-colors border border-[var(--border-subtle)]"
          >
            Delete for me
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm transition-colors border border-[var(--border-subtle)] mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageOptions;
