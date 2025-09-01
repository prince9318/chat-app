import { useContext, useRef, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const MessageOptions = ({ messageId, isOwnMessage, onClose, position }) => {
  const { deleteMessage } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);
  const menuRef = useRef(null);

  // Handle clicking outside to close the menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleDeleteForMe = () => {
    deleteMessage(messageId, "me");
    onClose();
  };

  const handleDeleteForEveryone = () => {
    deleteMessage(messageId, "everyone");
    onClose();
  };

  // Determine position based on whether the message is from the current user or not
  const positionClass =
    position === "left" ? "left-0 top-0 mt-8" : "right-0 top-0 mt-8";

  return (
    <div
      ref={menuRef}
      className={`absolute ${positionClass} bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-purple-500/30`}
      style={{ width: "180px" }}
    >
      <div className="flex flex-col">
        <button
          onClick={handleDeleteForMe}
          className="px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors w-full"
        >
          Delete for me
        </button>

        {isOwnMessage && (
          <button
            onClick={handleDeleteForEveryone}
            className="px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors w-full whitespace-nowrap"
          >
            Delete for everyone
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageOptions;
