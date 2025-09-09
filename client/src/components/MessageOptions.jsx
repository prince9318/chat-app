import { useContext, useRef, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const MessageOptions = ({ messageId, isOwnMessage, onClose, position }) => {
  const { deleteMessage } = useContext(ChatContext); // Function to delete a message
  const { authUser } = useContext(AuthContext); // Current logged-in user
  const menuRef = useRef(null); // Reference to the menu for outside-click detection

  /**
   * Close the menu if the user clicks outside of it
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose(); // Close menu
      }
    };

    // Attach listener on mount
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  /**
   * Delete the message only for the current user
   */
  const handleDeleteForMe = () => {
    deleteMessage(messageId, "me");
    onClose();
  };

  /**
   * Delete the message for everyone (only available for sender)
   */
  const handleDeleteForEveryone = () => {
    deleteMessage(messageId, "everyone");
    onClose();
  };

  // Decide where to position the menu (left or right of message bubble)
  const positionClass =
    position === "left" ? "left-0 top-0 mt-8" : "right-0 top-0 mt-8";

  return (
    <div
      ref={menuRef}
      className={`absolute ${positionClass} bg-gray-800 rounded-lg shadow-lg z-50 overflow-hidden border border-purple-500/30`}
      style={{ width: "180px" }}
    >
      <div className="flex flex-col">
        {/* Option: Delete for me (always visible) */}
        <button
          onClick={handleDeleteForMe}
          className="px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors w-full"
        >
          Delete for me
        </button>

        {/* Option: Delete for everyone (only visible for own messages) */}
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
