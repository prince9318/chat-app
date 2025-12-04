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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[90%] max-w-md rounded-xl bg-[#0b141a] border border-[#202c33] p-6 text-[#e9edef] shadow-2xl">
        <p className="text-base mb-4">Delete message?</p>
        <div className="flex flex-col gap-3">
          {isOwnMessage && (
            <button
              onClick={handleDeleteForEveryone}
              className="py-2 px-4 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-sm"
            >
              Delete for everyone
            </button>
          )}
          <button
            onClick={handleDeleteForMe}
            className="py-2 px-4 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-sm"
          >
            Delete for me
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageOptions;
