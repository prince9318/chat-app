import { useContext, useEffect, useRef, useState, Fragment } from "react";
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
  const messagesRef = useRef();

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
  const [currentDateLabel, setCurrentDateLabel] = useState("");
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

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    const update = () => {
      const markers = Array.from(
        container.getElementsByClassName("date-marker")
      );
      const contRect = container.getBoundingClientRect();
      let label = markers.length ? markers[0].dataset.dateLabel : "";
      for (let i = 0; i < markers.length; i++) {
        const r = markers[i].getBoundingClientRect();
        if (r.top - contRect.top <= 16) label = markers[i].dataset.dateLabel;
        else break;
      }
      setCurrentDateLabel(label);
    };
    update();
    container.addEventListener("scroll", update, { passive: true });
    return () => container.removeEventListener("scroll", update);
  }, [messages]);

  /**
   * Append emoji to message input
   */
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  /* 2.  USE THAT CLASS INSIDE renderTextWithLinks */
const renderTextWithLinks = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const parts = String(text).split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      const href = part.startsWith("http") ? part : `http://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline message-link"   /* <-- added message-link */
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

  return selectedUser ? (
    <div className="h-full min-h-0 relative flex flex-col">
      {/* ---------------- Profile Image Modal ---------------- */}
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        />
      )}

      {/* ---------------- Chat Header ---------------- */}
      <div className="sticky top-0 z-20 flex items-center gap-3 py-3 px-4 bg-[#202c33] border-b border-[#202c33]">
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
        <p className="flex-1 text-sm text-[#e9edef] flex items-center gap-2">
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
      <div ref={messagesRef} className="flex-1 min-h-0 flex flex-col overflow-y-auto p-3 chat-wallpaper messages-scroll">
        <div className="sticky top-0 z-10 flex justify-center pointer-events-none">
          {currentDateLabel && (
            <span className="px-3 py-1 text-xs rounded-full bg-[#202c33] text-[#e9edef]">{currentDateLabel}</span>
          )}
        </div>
        {messages.map((msg, index) => {
          const showDate =
            index === 0 ||
            (messages[index - 1] &&
              new Date(messages[index - 1].createdAt).toDateString() !==
                new Date(msg.createdAt).toDateString());
          const label = toLabel(msg.createdAt);
          return (
          <Fragment key={index}>
            {showDate && (
              <div className="date-marker w-full flex justify-center my-2" data-date-label={label}>
                {currentDateLabel !== label && (
                  <span className="px-3 py-1 text-xs rounded-full bg-[#202c33] text-[#e9edef]">{label}</span>
                )}
              </div>
            )}
            <div
              className={`w-full flex items-end gap-2 ${
                msg.senderId === authUser._id ? "justify-end" : "justify-start"
              }`}
            >
            {/* Message bubble + options */}
            <div className="relative inline-block">
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
              {(() => {
                const deletedForMe = Array.isArray(msg.deletedFor) && msg.deletedFor.includes(authUser._id);
                if (deletedForMe) return null;
                if (msg.isDeleted) {
                  return (
                    <div className="relative inline-block mb-8 group max-w-[85%] md:max-w-[70%] min-w-[160px]">
                      <p className="p-3 text-gray-300 italic bg-gray-800/50 rounded-xl border border-gray-600 break-normal whitespace-pre-wrap">This message was deleted</p>
                      <button
                        className={`absolute top-2 ${msg.senderId === authUser._id ? "right-2" : "left-2"} w-6 h-6 flex items-center justify-center rounded-full bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] opacity-0 group-hover:opacity-100 transition-opacity`}
                        aria-label="Message options"
                        onClick={() =>
                          setMessageOptionsState({
                            isOpen: true,
                            messageId: msg._id,
                            isOwnMessage: false,
                          })
                        }
                      >
                        ⋮
                      </button>
                    </div>
                  );
                }
                return (
                <>
                  {/* Image message */}
                  {msg.image ? (
                    <div className="relative inline-block mb-8 group">
                      <img
                        src={msg.image}
                        alt="img"
                        className="max-w-[250px] md:max-w-[300px] max-h-[70vh] object-contain shadow-xl rounded-2xl"
                        onClick={() => window.open(msg.image, "_blank")}
                      />
                      {/* Options button for image */}
                      <button
                        className={`absolute top-2 ${
                          msg.senderId === authUser._id ? "right-2" : "left-2"
                        } ... opacity-0 group-hover:opacity-100 transition-opacity`}
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
                      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-gray-300">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-blue-500" : "text-gray-400"}>✓✓</span>
                        )}
                      </div>
                    </div>
                  ) : msg.video ? (
                    /* Video message */
                    <div className="relative inline-block mb-8 group">
                      <video controls src={msg.video} className="..." />
                      <button
                        className={`absolute top-2 ${
                          msg.senderId === authUser._id ? "right-2" : "left-2"
                        } ... opacity-0 group-hover:opacity-100 transition-opacity`}
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
                      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-gray-300">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-blue-500" : "text-gray-400"}>✓✓</span>
                        )}
                      </div>
                    </div>
                  ) : msg.audio ? (
                    /* Audio message */
                    <div className="relative inline-block mb-8 group">
                      <audio controls src={msg.audio} className="..." />
                      <button
                        className={`absolute top-2 ${
                          msg.senderId === authUser._id ? "right-2" : "left-2"
                        } ... opacity-0 group-hover:opacity-100 transition-opacity`}
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
                      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-gray-300">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-blue-500" : "text-gray-400"}>✓✓</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative inline-block mb-8 group max-w-[85%] md:max-w-[70%] min-w-[160px]">
                      <p
  className={`message-bubble p-3 pr-10 rounded-2xl break-words whitespace-pre-wrap leading-relaxed shadow-md ${
    msg.senderId === authUser._id
      ? "bg-[#128C7E] text-white rounded-tr-none"
      : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
  }`}
>
  {renderTextWithLinks(msg.text)}
</p>
                      <button
                        className={`absolute top-2 ${
                          msg.senderId === authUser._id ? "right-2" : "left-2"
                        } w-6 h-6 flex items-center justify-center rounded-full bg-[#202c33] hover:bg-[#2a3942] text-[#e9edef] opacity-0 group-hover:opacity-100 transition-opacity`}
                        aria-label="Message options"
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
                      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-gray-300">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-blue-500" : "text-gray-400"}>✓✓</span>
                        )}
                      </div>
                    </div>
                  )}
                </>
                );
              })()}
            </div>
            </div>
            
          </Fragment>
          )})}
        {/* Scroll anchor (auto-scroll to bottom) */}
        <div ref={scrollEnd}></div>
      </div>

      {/* ---------------- Bottom Input Area ---------------- */}
      <div className="shrink-0 flex items-center gap-3 p-4 bg-[#202c33] border-t border-[#202c33]">
        <div className="flex-1 flex items-center bg-[#111b21] px-4 py-2 rounded-xl border border-[#202c33]">
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
            className="flex-1 text-sm p-2 mx-2 bg-transparent text-[#e9edef] placeholder-gray-400 focus:outline-none"
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
            <div className="p-2 rounded-full hover:bg-[#2a3942]">
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
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-green-600 cursor-pointer">
              <img src={assets.mic_icon} alt="audio" className="w-4 h-4" />
            </div>
          </label>
        </div>

        {/* Send button */}
        <div
          onClick={handleSendMessage}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-green-600 cursor-pointer"
        >
          <img src={assets.send_button} alt="Send" className="w-5 h-5" />
        </div>
      </div>
    </div>
  ) : (
    // Empty chat screen (when no user is selected)
    <div className="flex flex-col items-center justify-center gap-2 text-gray-300 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white drop-shadow-lg">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
