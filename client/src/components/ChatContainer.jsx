import { useContext, useEffect, useRef, useState, Fragment } from "react";
import assets from "../assets/assets";
import { formatMessageTime, formatCallDuration } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { CallContext } from "../context/CallContext";
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
  const { startCall } = useContext(CallContext);

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

      {/* Chat header - WhatsApp Web style */}
      <div className="sticky top-0 z-20 flex items-center gap-3 py-2 px-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] min-h-[59px]">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-10 h-10 rounded-full object-cover cursor-pointer shrink-0"
          onClick={() =>
            setProfileModal({
              isOpen: true,
              imageUrl: selectedUser.profilePic || assets.avatar_icon,
              userName: selectedUser.fullName,
            })
          }
        />
        <div className="flex-1 min-w-0">
          <p className="text-[var(--text-primary)] font-medium truncate">
            {selectedUser.fullName}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {onlineUsers.includes(selectedUser._id) ? "online" : "offline"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="md:hidden p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
          aria-label="Back"
        >
          <img src={assets.arrow_icon} alt="" className="w-5 h-5 opacity-80" />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => startCall(selectedUser, "audio")}
            className="p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
            aria-label="Voice call"
            title="Voice call"
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => startCall(selectedUser, "video")}
            className="p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
            aria-label="Video call"
            title="Video call"
          >
            <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button type="button" className="p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors md:block hidden" aria-label="Info">
            <img src={assets.help_icon} alt="" className="w-5 h-5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Messages area - balanced padding; bubbles use more width for readable lines */}
      <div ref={messagesRef} className="flex-1 min-h-0 flex flex-col overflow-y-auto px-3 py-1 chat-wallpaper messages-scroll">
        <div className="sticky top-0 z-10 flex justify-center pointer-events-none py-2">
          {currentDateLabel && (
            <span className="text-[var(--text-muted)] text-xs">
              {currentDateLabel}
            </span>
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
              <div className="date-marker w-full flex justify-center my-4" data-date-label={label}>
                {currentDateLabel !== label && (
                  <span className="text-[var(--text-muted)] text-xs">{label}</span>
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
                    <div className="relative inline-block mb-1 group max-w-[min(85%,22rem)] min-w-[120px]">
                      <p className="p-3 text-[var(--text-muted)] italic bg-[var(--received-bubble)] bubble-received break-normal whitespace-pre-wrap text-sm">This message was deleted</p>
                      <button
                        type="button"
                        className={`absolute top-2 ${msg.senderId === authUser._id ? "right-2" : "left-2"} w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border-subtle)]`}
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
                if (msg.messageType === "call") {
                  const isVideo = msg.callType === "video";
                  const isMissed = msg.callStatus === "missed";
                  const durationStr = formatCallDuration(msg.callDuration);
                  const label = isMissed
                    ? `Missed ${isVideo ? "video" : "voice"} call`
                    : `${isVideo ? "Video" : "Voice"} call${durationStr ? ` · ${durationStr}` : ""}`;
                  return (
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] text-sm ${
                        msg.senderId === authUser._id
                          ? "bg-[var(--sent-bubble)] text-white bubble-sent"
                          : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
                      }`}
                    >
                      {isVideo ? (
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      )}
                      <span>{label}</span>
                      <span className="text-[11px] opacity-90 ml-1">{formatMessageTime(msg.createdAt)}</span>
                    </div>
                  );
                }
                const optionBtnClass = "absolute top-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border-subtle)]";
                return (
                <>
                  {msg.image ? (
                    <div className="relative inline-block mb-6 group">
                      <img
                        src={msg.image}
                        alt="img"
                        className="max-w-[250px] md:max-w-[300px] max-h-[70vh] object-contain shadow-lg rounded-[var(--radius-xl)] cursor-pointer"
                        onClick={() => window.open(msg.image, "_blank")}
                      />
                      <button
                        type="button"
                        className={`${optionBtnClass} ${msg.senderId === authUser._id ? "right-2" : "left-2"}`}
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
                      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-[var(--text-muted)]">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}>✓✓</span>
                        )}
                      </div>
                    </div>
                  ) : msg.video ? (
                    <div className="relative inline-block mb-6 group">
                      <video controls src={msg.video} className="max-w-[250px] md:max-w-[300px] max-h-[50vh] rounded-[var(--radius-xl)] shadow-lg" />
                      <button
                        type="button"
                        className={`${optionBtnClass} ${msg.senderId === authUser._id ? "right-2" : "left-2"}`}
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
                      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-[var(--text-muted)]">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}>✓✓</span>
                        )}
                      </div>
                    </div>
                  ) : msg.audio ? (
                    <div className="relative inline-block mb-6 group">
                      <audio controls src={msg.audio} className="max-w-[240px] h-9" />
                      <button
                        type="button"
                        className={`${optionBtnClass} ${msg.senderId === authUser._id ? "right-2" : "left-2"}`}
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
                      <div className="absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-1 text-[var(--text-muted)]">
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}>✓✓</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative inline-block mb-1 group min-w-[7rem] max-w-[min(90%,28rem)]">
                      <p
                        className={`message-bubble p-2 pl-3 pr-12 pb-1 pt-2 text-sm ${
                          msg.senderId === authUser._id
                            ? "bg-[var(--sent-bubble)] text-white bubble-sent"
                            : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
                        }`}
                      >
                        {renderTextWithLinks(msg.text)}
                      </p>
                      <button
                        type="button"
                        className={`${optionBtnClass} ${msg.senderId === authUser._id ? "right-2" : "left-2"}`}
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
                      <div className={`absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-0.5 opacity-90 ${msg.senderId === authUser._id ? "text-white/90" : "text-[var(--text-muted)]"}`}>
                        <span>{formatMessageTime(msg.createdAt)}</span>
                        {msg.senderId === authUser._id && (
                          <span className={msg.seen ? "text-white" : "text-white/70"} style={{ marginLeft: "2px" }}>✓✓</span>
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
        <div ref={scrollEnd} />
      </div>

      {/* Input area - WhatsApp Web style */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-3 bg-[var(--bg-elevated)]">
        <div className="flex-1 flex items-center gap-1 bg-[var(--bg-input)] pl-3 pr-1 py-1.5 rounded-[1.75rem] min-h-[42px]">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 rounded-full hover:bg-[var(--accent-soft)] transition-colors"
            aria-label="Emoji"
          >
            <img src={assets.emoji_icon} alt="" className="w-5 h-5 opacity-80" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-modal)]">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                width={300}
                height={360}
              />
            </div>
          )}

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Type a message"
            className="flex-1 min-w-0 text-sm px-2 py-1.5 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />

          <input
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                if (file.type.startsWith("image/")) handleSendImage(e);
                else if (file.type.startsWith("video/")) handleSendVideo(e);
                else toast.error("Please select an image or video file");
              }
            }}
            type="file"
            id="media"
            accept="image/png, image/jpeg, video/*"
            hidden
          />
          <label htmlFor="media" className="p-2 rounded-full hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors">
            <img src={assets.gallery_icon} alt="Attach" className="w-5 h-5 opacity-80" />
          </label>

          <input onChange={handleSendAudio} type="file" id="audio" accept="audio/*" hidden />
          <label htmlFor="audio" className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] cursor-pointer transition-colors shrink-0">
            <img src={assets.mic_icon} alt="Voice" className="w-4 h-4 invert" />
          </label>
        </div>

        <button
          type="button"
          onClick={handleSendMessage}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors shrink-0"
          aria-label="Send"
        >
          <img src={assets.send_button} alt="" className="w-5 h-5 invert" />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-6 bg-[var(--bg-app)] max-md:hidden px-6">
      <div className="w-24 h-24 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
        <img src={assets.logo_icon} className="w-14 h-14 opacity-70" alt="" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-[var(--text-primary)]">Chat anytime, anywhere</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">Select a chat from the list or search for someone</p>
      </div>
    </div>
  );
};

export default ChatContainer;
