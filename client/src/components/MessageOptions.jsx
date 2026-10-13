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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 w-full h-full bg-black/70 backdrop-blur-sm border-0 cursor-default"
      />
      <div className="relative z-10 w-full max-w-sm rounded-3xl sm:rounded-2xl bg-[#182329] border border-white/10 p-5 sm:p-6 text-[var(--text-primary)] shadow-2xl shadow-black/80 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Delete message?</h3>
            <p className="text-xs text-[var(--text-muted)]">Choose how you'd like to delete this message.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {isOwnMessage && (
            <button
              type="button"
              onClick={handleDeleteForEveryone}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-200 text-sm font-medium transition-colors border border-red-500/20 cursor-pointer active:scale-[0.98]"
            >
              Delete for everyone
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteForMe}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium transition-colors border border-white/10 cursor-pointer active:scale-[0.98]"
          >
            Delete for me
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl hover:bg-white/[0.04] text-[var(--text-secondary)] hover:text-white text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageOptions;
