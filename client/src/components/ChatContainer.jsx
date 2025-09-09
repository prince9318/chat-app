import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import ProfileImageModal from "./ProfileImageModal";
import MessageOptions from "./MessageOptions";

const ChatContainer = () => {
  // Extract data and functions from Chat context
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  // Extract user-related data from Auth context
  const { authUser, onlineUsers } = useContext(AuthContext);

  // Reference for auto-scrolling chat to bottom
  const scrollEnd = useRef();

  // Local state for input field, emoji picker, and modals
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    imageUrl: "",
    userName: "",
  });
  const [messageOptionsState, setMessageOptionsState] = useState({
    isOpen: false,
    messageId: null,
    isOwnMessage: false,
  });

  /**
   * Send a text message
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null; // ignore empty input
    await sendMessage({ text: input.trim() });
    setInput(""); // clear input after sending
  };

  /**
   * Send an audio message
   */
  const handleSendAudio = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("audio/")) {
      toast.error("Select a valid audio file");
      return;
    }
    const reader = new FileReader();

    // Convert audio file to base64 and send
    reader.onloadend = async () => {
      await sendMessage({ audio: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  /**
   * Send an image message
   */
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file");
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  /**
   * Send a video message (max 50MB)
   */
  const handleSendVideo = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("video/")) {
      toast.error("Select a valid video file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file is too large (max 50MB)");
      return;
    }

    toast.loading("Uploading video...");
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ video: reader.result });
      toast.dismiss();
      toast.success("Video sent successfully");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  /**
   * Fetch messages when a user is selected
   */
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  /**
   * Auto-scroll to the bottom whenever messages update
   */
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * Append emoji to message input
   */
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* ---------------- Profile Image Modal ---------------- */}
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        />
      )}

      {/* ---------------- Chat Header ---------------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        {/* Profile picture */}
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
          onClick={() =>
            setProfileModal({
              isOpen: true,
              imageUrl: selectedUser.profilePic || assets.avatar_icon,
              userName: selectedUser.fullName,
            })
          }
        />

        {/* Username + online status */}
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>

        {/* Back button (mobile only) */}
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="back"
          className="md:hidden max-w-7"
        />

        {/* Help icon (desktop only) */}
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* ---------------- Chat Messages Area ---------------- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {/* Message bubble + options */}
            <div className="relative">
              {/* Message options menu */}
              {messageOptionsState.isOpen &&
                messageOptionsState.messageId === msg._id && (
                  <MessageOptions
                    messageId={msg._id}
                    isOwnMessage={msg.senderId === authUser._id}
                    position={msg.senderId !== authUser._id ? "left" : "right"}
                    onClose={() =>
                      setMessageOptionsState({
                        isOpen: false,
                        messageId: null,
                        isOwnMessage: false,
                      })
                    }
                  />
                )}

              {/* Render message types: Image | Video | Audio | Text */}
              {!msg.isDeleted && !msg.deletedFor?.includes(authUser._id) ? (
                <>
                  {/* Image message */}
                  {msg.image ? (
                    <div className="relative mb-8 group">
                      <img
                        src={msg.image}
                        alt="img"
                        className="max-w-[250px] md:max-w-[300px] shadow-xl rounded-2xl"
                        onClick={() => window.open(msg.image, "_blank")}
                      />
                      {/* Options button for image */}
                      <button
                        className="absolute top-2 right-2 ..."
                        onClick={(e) => {
                          e.stopPropagation();
                          setMessageOptionsState({
                            isOpen: true,
                            messageId: msg._id,
                            isOwnMessage: msg.senderId === authUser._id,
                          });
                        }}
                      >
                        ⋮
                      </button>
                    </div>
                  ) : msg.video ? (
                    /* Video message */
                    <div className="relative mb-8">
                      <video controls src={msg.video} className="..." />
                      <button
                        className="absolute top-2 right-2 ..."
                        onClick={() =>
                          setMessageOptionsState({
                            isOpen: true,
                            messageId: msg._id,
                            isOwnMessage: msg.senderId === authUser._id,
                          })
                        }
                      >
                        ⋮
                      </button>
                    </div>
                  ) : msg.audio ? (
                    /* Audio message */
                    <div className="relative mb-8">
                      <audio controls src={msg.audio} className="..." />
                      <button
                        className="absolute top-2 right-2 ..."
                        onClick={() =>
                          setMessageOptionsState({
                            isOpen: true,
                            messageId: msg._id,
                            isOwnMessage: msg.senderId === authUser._id,
                          })
                        }
                      >
                        ⋮
                      </button>
                    </div>
                  ) : (
                    /* Text message */
                    <div className="relative">
                      <p
                        className={`p-3 max-w-[250px] rounded-xl mb-8 ${
                          msg.senderId === authUser._id
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 text-white"
                        }`}
                      >
                        {msg.text}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Deleted message placeholder
                <p className="p-3 max-w-[250px] text-gray-400 italic">
                  This message was deleted
                </p>
              )}
            </div>

            {/* Sender info + timestamp */}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt="profile"
                className="w-7 rounded-full cursor-pointer"
                onClick={() =>
                  setProfileModal({
                    isOpen: true,
                    imageUrl:
                      msg.senderId === authUser._id
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon,
                    userName:
                      msg.senderId === authUser._id
                        ? authUser.fullName
                        : selectedUser.fullName,
                  })
                }
              />
              <p
                className={
                  msg.senderId === authUser._id
                    ? "text-green-400"
                    : "text-blue-400"
                }
              >
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        {/* Scroll anchor (auto-scroll to bottom) */}
        <div ref={scrollEnd}></div>
      </div>

      {/* ---------------- Bottom Input Area ---------------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4 backdrop-blur-md bg-black/20">
        <div className="flex-1 flex items-center bg-gray-800/50 px-4 py-2 rounded-xl shadow-inner border border-purple-500/20">
          {/* Emoji button */}
          <div className="hover:bg-purple-500/20 p-2 rounded-full">
            <img
              src={assets.emoji_icon}
              alt="emoji"
              className="w-6 cursor-pointer"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
          </div>

          {/* Emoji picker popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-50">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                width={300}
                height={400}
              />
            </div>
          )}

          {/* Text input */}
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Type a message"
            className="flex-1 text-sm p-3 mx-2 bg-transparent text-white"
          />

          {/* Image / Video upload */}
          <input
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.type.startsWith("image/")) {
                  handleSendImage(e);
                } else if (file.type.startsWith("video/")) {
                  handleSendVideo(e);
                } else {
                  toast.error("Please select an image or video file");
                }
              }
            }}
            type="file"
            id="media"
            accept="image/png, image/jpeg, video/*"
            hidden
          />
          <label htmlFor="media">
            <div className="hover:bg-purple-500/20 p-2 rounded-full">
              <img
                src={assets.gallery_icon}
                alt="media"
                className="w-5 cursor-pointer"
              />
            </div>
          </label>

          {/* Audio upload */}
          <input
            onChange={handleSendAudio}
            type="file"
            id="audio"
            accept="audio/*"
            hidden
          />
          <label htmlFor="audio">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-600 cursor-pointer">
              <img src={assets.mic_icon} alt="audio" className="w-4 h-4" />
            </div>
          </label>
        </div>

        {/* Send button */}
        <div
          onClick={handleSendMessage}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 cursor-pointer"
        >
          <img src={assets.send_button} alt="Send" className="w-5 h-5" />
        </div>
      </div>
    </div>
  ) : (
    // Empty chat screen (when no user is selected)
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
