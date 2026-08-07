import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from "react";
import assets from "../assets/assets";
import {
  formatMessageTime,
  formatCallDuration,
  formatFileSize,
  extractUrls,
  normalizeUrl,
  getFileTypeLabel,
} from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { CallContext } from "../context/CallContext";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";
import ProfileImageModal from "./ProfileImageModal";
import MessageOptions from "./MessageOptions";

const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024;

const ChatContainer = () => {
  // Extract data and functions from Chat context
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    sendAudioMessage,
    getMessages,
  } = useContext(ChatContext);

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
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    url: "",
    type: "",
    title: "",
  });
  const [messageOptionsState, setMessageOptionsState] = useState({
    isOpen: false,
    messageId: null,
    isOwnMessage: false,
  });
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaChunksRef = useRef([]);

  const getPreviewType = (file) => {
    const mimeType = String(file?.mimeType || "").toLowerCase();
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.includes("pdf")) return "pdf";
    return "file";
  };

  const openPreview = (url, type, title) => {
    if (!url) return;
    setPreviewModal({ isOpen: true, url, type, title });
  };

  const openMediaPreview = (msg) => {
    const url = msg?.image || msg?.video || msg?.audio;
    if (!url) return;

    const type = msg?.image ? "image" : msg?.video ? "video" : "audio";
    const title = msg?.image
      ? "Image preview"
      : msg?.video
        ? "Video preview"
        : "Audio preview";

    openPreview(url, type, title);
  };

  const closePreview = () =>
    setPreviewModal({ isOpen: false, url: "", type: "", title: "" });

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    recorder.stop();
    setIsRecording(false);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaChunksRef.current = [];

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          mediaChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(mediaChunksRef.current, {
          type: "audio/webm",
        });
        mediaChunksRef.current = [];

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }

        if (audioBlob.size > 0) {
          await sendAudioMessage(audioBlob);
        } else {
          toast.error("No audio captured.");
        }
      };

      recorder.start();
      setIsRecording(true);
      toast.success("Recording started. Tap again to send.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to access microphone.");
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  const [showSharedDocs, setShowSharedDocs] = useState(false);
  const [currentDateLabel, setCurrentDateLabel] = useState("");
  const hasMessageText = input.trim().length > 0;
  const sharedMedia = useMemo(
    () => messages.filter((msg) => msg.image || msg.video || msg.audio),
    [messages],
  );
  const sharedFiles = useMemo(
    () => messages.filter((msg) => msg.file?.url),
    [messages],
  );
  const sharedLinks = useMemo(
    () =>
      messages
        .flatMap((msg) =>
          extractUrls(msg.text).map((url) => ({
            url,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
          })),
        )
        .filter((item) => item.url),
    [messages],
  );
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

  const sendAttachmentFile = async (file) => {
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      toast.error("Attachment is too large (max 50MB)");
      return;
    }

    const formData = new FormData();
    formData.append("attachment", file);

    const toastId = toast.loading(`Uploading ${file.name}...`);
    const result = await sendMessage(formData);
    toast.dismiss(toastId);

    if (result?.success) {
      toast.success(`${file.name} sent`);
    }
  };

  const handleSendAttachment = async (e) => {
    const file = e.target.files?.[0];
    await sendAttachmentFile(file);
    e.target.value = "";
  };

  const handleSendAudio = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("audio/")) {
      toast.error("Select a valid audio file");
      e.target.value = "";
      return;
    }

    await sendAttachmentFile(file);
    e.target.value = "";
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
        container.getElementsByClassName("date-marker"),
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

  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const parts = String(text || "").split(urlRegex);

    return parts.map((part, i) => {
      const isLink = /^(https?:\/\/|www\.)/i.test(part);

      if (!isLink) return <span key={i}>{part}</span>;

      return (
        <a
          key={i}
          href={normalizeUrl(part)}
          target="_blank"
          rel="noopener noreferrer"
          className="underline message-link break-all"
        >
          {part}
        </a>
      );
    });
  };

  const getSingleLink = (text) => {
    const links = extractUrls(text);
    if (links.length !== 1) return null;
    return String(text || "").trim() === links[0] ? links[0] : null;
  };

  const getLinkHost = (url) => {
    try {
      return new URL(normalizeUrl(url)).hostname.replace(/^www\./i, "");
    } catch {
      return "Open link";
    }
  };

  const renderFileBadge = (file, isOwnMessage) => (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm ${
        isOwnMessage
          ? "bg-white/12 text-white border border-white/10"
          : "bg-[var(--bg-app)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
      }`}
    >
      {getFileTypeLabel(file)}
    </div>
  );

  return selectedUser ? (
    <div className="h-full min-h-0 relative flex flex-col bg-[var(--bg-panel)] max-md:fixed max-md:inset-0 max-md:z-30">
      {/* ---------------- Profile Image Modal ---------------- */}
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        />
      )}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[var(--shadow-modal)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-elevated)]">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {previewModal.title}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {previewModal.type === "file"
                    ? "File preview is not available for this type."
                    : `Preview ${previewModal.type}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-3 py-1 text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-input)]"
                >
                  Open in new tab
                </a>
                <button
                  type="button"
                  onClick={closePreview}
                  className="touch-target rounded-full p-2 hover:bg-[var(--bg-input)] transition-colors"
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-[var(--bg-panel)] p-4">
              {previewModal.type === "image" && (
                <img
                  src={previewModal.url}
                  alt={previewModal.title}
                  className="mx-auto max-h-[70vh] w-auto rounded-[var(--radius-lg)] object-contain"
                />
              )}
              {previewModal.type === "video" && (
                <video
                  controls
                  src={previewModal.url}
                  className="w-full rounded-[var(--radius-lg)]"
                />
              )}
              {previewModal.type === "audio" && (
                <audio controls src={previewModal.url} className="w-full" />
              )}
              {previewModal.type === "pdf" && (
                <object
                  data={previewModal.url}
                  type="application/pdf"
                  className="w-full min-h-[60vh] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
                >
                  <p className="text-sm text-[var(--text-secondary)]">
                    PDF preview is not supported by your browser. Use the button
                    above to open or download the file.
                  </p>
                </object>
              )}
              {previewModal.type === "file" && (
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-app)] p-6 text-sm text-[var(--text-secondary)]">
                  <p className="font-medium text-[var(--text-primary)]">
                    {previewModal.title}
                  </p>
                  <p className="mt-2">
                    This file type cannot be previewed in the app. Use the
                    button above to open it in a new tab or download it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat header - WhatsApp style: back on mobile, then avatar + name */}
      <div className="chat-header sticky top-0 z-20 flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-4 bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] min-h-[56px] sm:min-h-[59px] safe-top">
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="md:hidden touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors shrink-0 -ml-1"
          aria-label="Back to chats"
        >
          <img src={assets.arrow_icon} alt="" className="w-5 h-5 opacity-80" />
        </button>
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
          <p className="text-[var(--text-primary)] font-medium truncate text-[15px] sm:text-base">
            {selectedUser.fullName}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {onlineUsers.includes(selectedUser._id) ? "online" : "offline"}
          </p>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            type="button"
            onClick={() => startCall(selectedUser, "audio")}
            className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
            aria-label="Voice call"
            title="Voice call"
          >
            <svg
              className="w-5 h-5 text-[var(--text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => startCall(selectedUser, "video")}
            className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors flex max-[380px]:hidden"
            aria-label="Video call"
            title="Video call"
          >
            <svg
              className="w-5 h-5 text-[var(--text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setShowSharedDocs(true)}
            className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
            aria-label="Open shared media"
            title="Media, links and docs"
          >
            <svg
              className="w-5 h-5 text-[var(--text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4 6a2 2 0 012-2h10a2 2 0 012 2v2h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors lg:flex hidden"
            aria-label="Info"
          >
            <img src={assets.help_icon} alt="" className="w-5 h-5 opacity-80" />
          </button>
        </div>
      </div>

      {/* Messages area - balanced padding; bubbles use more width for readable lines */}
      {showSharedDocs && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[var(--shadow-modal)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-elevated)]">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Media, links & docs
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Shared items from this chat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSharedDocs(false)}
                className="touch-target rounded-full p-2 hover:bg-[var(--bg-input)] transition-colors"
                aria-label="Close media panel"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Media
                    </p>
                    {sharedMedia.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {sharedMedia.map((msg, index) => (
                          <button
                            key={`${msg._id || index}-${index}`}
                            type="button"
                            onClick={() => openMediaPreview(msg)}
                            className="aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-app)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          >
                            {msg.image ? (
                              <img
                                src={msg.image}
                                alt="Shared media"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">
                                {msg.video ? "VIDEO" : "AUDIO"}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        No shared media yet.
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                      Documents & attachments
                    </p>
                    {sharedFiles.length ? (
                      <div className="mt-3 space-y-3">
                        {sharedFiles.map((msg) => (
                          <a
                            key={msg._id}
                            href={msg.file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                          >
                            <span className="font-medium">
                              {msg.file.name || "Attachment"}
                            </span>
                            <span className="block text-[var(--text-secondary)] text-xs mt-1">
                              {msg.file.mimeType || "File"}
                            </span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[var(--text-secondary)]">
                        No attached docs or files.
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[var(--text-muted)]">
                    Links
                  </p>
                  {sharedLinks.length ? (
                    <div className="mt-3 space-y-2">
                      {sharedLinks.map((item, index) => (
                        <a
                          key={`${item.url}-${index}`}
                          href={normalizeUrl(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                        >
                          {item.url}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-[var(--text-secondary)]">
                      No shared links found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        ref={messagesRef}
        className="flex-1 min-h-0 flex flex-col overflow-y-auto px-3 py-1 chat-wallpaper messages-scroll"
      >
        <div className="sticky top-0 z-10 flex justify-center pointer-events-none py-2">
          {currentDateLabel && (
            <span className="date-chip text-xs">{currentDateLabel}</span>
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
                <div
                  className="date-marker w-full flex justify-center my-4"
                  data-date-label={label}
                >
                  {currentDateLabel !== label && (
                    <span className="date-chip text-xs">{label}</span>
                  )}
                </div>
              )}
              <div
                className={`w-full flex items-end gap-2 ${
                  msg.senderId === authUser._id
                    ? "justify-end"
                    : "justify-start"
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
                        position={
                          msg.senderId !== authUser._id ? "left" : "right"
                        }
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
                    const deletedForMe =
                      Array.isArray(msg.deletedFor) &&
                      msg.deletedFor.includes(authUser._id);
                    if (deletedForMe) return null;
                    if (msg.isDeleted) {
                      return (
                        <div className="relative inline-block mb-1 group max-w-[min(85%,22rem)] min-w-[120px]">
                          <p className="p-3 text-[var(--text-muted)] italic bg-[var(--received-bubble)] bubble-received break-normal whitespace-pre-wrap text-sm">
                            This message was deleted
                          </p>
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
                            <svg
                              className="w-4 h-4 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          )}
                          <span>{label}</span>
                          <span className="text-[11px] opacity-90 ml-1">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    }
                    const optionBtnClass =
                      "absolute top-2 w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-input)] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity border border-[var(--border-subtle)]";
                    return (
                      <>
                        {msg.image ? (
                          <div className="relative inline-block mb-6 group">
                            <img
                              src={msg.image}
                              alt="img"
                              className="max-w-[min(85vw,250px)] sm:max-w-[250px] md:max-w-[300px] max-h-[70vh] object-contain shadow-lg rounded-[var(--radius-xl)] cursor-pointer"
                              onClick={() =>
                                openPreview(msg.image, "image", "Image preview")
                              }
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
                                <span
                                  className={
                                    msg.seen
                                      ? "text-blue-400"
                                      : "text-[var(--text-muted)]"
                                  }
                                >
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>
                        ) : msg.video ? (
                          <div className="relative inline-block mb-6 group">
                            <video
                              controls
                              src={msg.video}
                              className="max-w-[min(85vw,250px)] sm:max-w-[250px] md:max-w-[300px] max-h-[50vh] rounded-[var(--radius-xl)] shadow-lg"
                            />
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
                                <span
                                  className={
                                    msg.seen
                                      ? "text-blue-400"
                                      : "text-[var(--text-muted)]"
                                  }
                                >
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>
                        ) : msg.audio ? (
                          <div className="relative inline-block mb-6 group">
                            <audio
                              controls
                              src={msg.audio}
                              className="max-w-[240px] h-9"
                            />
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
                                <span
                                  className={
                                    msg.seen
                                      ? "text-blue-400"
                                      : "text-[var(--text-muted)]"
                                  }
                                >
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>
                        ) : msg.file?.url ? (
                          <div
                            className={`message-card relative inline-flex items-start gap-3 min-w-[15rem] max-w-[min(90vw,24rem)] rounded-[var(--radius-xl)] px-3 py-3 mb-1 group ${
                              msg.senderId === authUser._id
                                ? "bg-[var(--sent-bubble)] text-white bubble-sent"
                                : "bg-[var(--received-bubble)] text-[var(--text-primary)] bubble-received"
                            }`}
                          >
                            {renderFileBadge(
                              msg.file,
                              msg.senderId === authUser._id,
                            )}
                            <div className="min-w-0 flex-1 pr-10">
                              <a
                                href={msg.file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block font-medium break-words underline-offset-2 hover:underline"
                              >
                                {msg.file.name || "Attachment"}
                              </a>
                              <p
                                className={`text-xs mt-1 ${msg.senderId === authUser._id ? "text-white/80" : "text-[var(--text-muted)]"}`}
                              >
                                {formatFileSize(msg.file.size)}
                                {msg.file.mimeType
                                  ? ` • ${msg.file.mimeType}`
                                  : ""}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <a
                                  href={msg.file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
                                >
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16"
                                    />
                                  </svg>
                                  Open file
                                </a>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openPreview(
                                      msg.file.url,
                                      getPreviewType(msg.file),
                                      msg.file.name || "Attachment preview",
                                    )
                                  }
                                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--bg-elevated)]"
                                >
                                  Preview
                                </button>
                              </div>
                            </div>
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
                            <div
                              className={`absolute bottom-2 right-3 text-[11px] leading-none flex items-center gap-0.5 opacity-90 ${msg.senderId === authUser._id ? "text-white/90" : "text-[var(--text-muted)]"}`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {msg.senderId === authUser._id && (
                                <span
                                  className={
                                    msg.seen
                                      ? "text-blue-400"
                                      : "text-[var(--text-muted)]"
                                  }
                                  style={{ marginLeft: "2px" }}
                                >
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>
                        ) : getSingleLink(msg.text) ? (
                          <div
                            className={`message-card relative inline-block mb-1 group min-w-[12rem] max-w-[min(90%,28rem)] ${
                              msg.senderId === authUser._id
                                ? "text-white"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            <a
                              href={normalizeUrl(getSingleLink(msg.text))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block rounded-[var(--radius-xl)] px-3 py-3 pr-12 ${
                                msg.senderId === authUser._id
                                  ? "bg-[var(--sent-bubble)] bubble-sent"
                                  : "bg-[var(--received-bubble)] bubble-received"
                              }`}
                            >
                              <p className="text-xs uppercase tracking-wide opacity-75">
                                Link
                              </p>
                              <div className="mt-2 flex items-start gap-2">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.senderId === authUser._id ? "bg-white/12" : "bg-[var(--bg-app)] border border-[var(--border-subtle)]"}`}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 01-5.656-5.656l1.414-1.414m8.486-1.414l1.414-1.414a4 4 0 015.656 5.656l-2 2a4 4 0 01-5.656 0"
                                    />
                                  </svg>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium break-all">
                                    {getLinkHost(getSingleLink(msg.text))}
                                  </p>
                                  <p
                                    className={`text-xs break-all mt-1 ${msg.senderId === authUser._id ? "text-white/80" : "text-[var(--text-muted)]"}`}
                                  >
                                    {getSingleLink(msg.text)}
                                  </p>
                                </div>
                              </div>
                            </a>
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
                            <div
                              className={`absolute bottom-2 right-2 text-[11px] leading-none flex items-center gap-0.5 opacity-90 ${msg.senderId === authUser._id ? "text-white/90" : "text-[var(--text-muted)]"}`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {msg.senderId === authUser._id && (
                                <span
                                  className={
                                    msg.seen ? "text-white" : "text-white/70"
                                  }
                                  style={{ marginLeft: "2px" }}
                                >
                                  ✓✓
                                </span>
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
                            <div
                              className={`absolute bottom-1 right-2 text-[11px] leading-none flex items-center gap-0.5 opacity-90 ${msg.senderId === authUser._id ? "text-white/90" : "text-[var(--text-muted)]"}`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {msg.senderId === authUser._id && (
                                <span
                                  className={
                                    msg.seen ? "text-white" : "text-white/70"
                                  }
                                  style={{ marginLeft: "2px" }}
                                >
                                  ✓✓
                                </span>
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
          );
        })}
        <div ref={scrollEnd} />
      </div>

      {/* Input area - WhatsApp Web style */}
      <div className="chat-composer shrink-0 px-2 sm:px-4 py-2 sm:py-3 bg-[var(--bg-elevated)] safe-bottom">
        <div className="flex items-end gap-2 sm:gap-2.5">
          <div className="flex-1 flex items-center gap-0.5 sm:gap-1.5 bg-[var(--bg-input)] pl-1.5 sm:pl-2.5 pr-1 sm:pr-1.5 py-1 sm:py-1.5 rounded-[1.25rem] min-h-[48px] sm:min-h-[52px] border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-[var(--accent-soft)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0"
              aria-label="Emoji"
            >
              <img
                src={assets.emoji_icon}
                alt=""
                className="w-5 h-5 opacity-80"
              />
            </button>

            {showEmojiPicker && (
              <div className="fixed sm:absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 left-2 right-2 sm:left-4 sm:right-auto z-50 rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-modal)] max-w-[min(100vw-1rem,320px)] mx-auto sm:mx-0">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  width="100%"
                  height={320}
                />
              </div>
            )}

            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              onKeyDown={(e) =>
                e.key === "Enter" ? handleSendMessage(e) : null
              }
              type="text"
              placeholder="Type a message or paste a link"
              className="flex-1 min-w-0 text-sm px-2 py-2 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
            />

            <input
              onChange={handleSendAttachment}
              type="file"
              id="attachment"
              accept="*/*"
              hidden
            />
            <label
              htmlFor="attachment"
              className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0"
              title="Attach file"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M16.5 6.5l-7.793 7.793a3 3 0 104.243 4.243l8.132-8.132a5 5 0 10-7.071-7.071L5.879 11.464a7 7 0 109.9 9.9l6.01-6.01"
                />
              </svg>
            </label>

            <button
              type="button"
              onClick={toggleRecording}
              className={`touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-colors shrink-0 ${
                isRecording
                  ? "bg-red-500 text-white"
                  : "bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white"
              }`}
              aria-label={
                isRecording ? "Stop recording" : "Record voice message"
              }
              title={
                isRecording
                  ? "Stop and send voice message"
                  : "Record voice message"
              }
            >
              <img
                src={assets.mic_icon}
                alt="Voice"
                className="w-4 h-4 opacity-85 hover:opacity-100"
              />
            </button>

            <button
              type="button"
              onClick={handleSendMessage}
              className={`touch-target w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all duration-200 shrink-0 shadow-[var(--shadow-card)] ${
                hasMessageText
                  ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] scale-100"
                  : "bg-[var(--bg-input)] text-[var(--text-muted)] hover:bg-[var(--bg-input)]"
              }`}
              aria-label="Send"
            >
              <img
                src={assets.send_button}
                alt=""
                className={`w-5 h-5 ${hasMessageText ? "invert" : "opacity-45"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="hidden md:flex flex-col items-center justify-center gap-6 bg-[var(--bg-app)] chat-wallpaper px-6 min-h-0 h-full">
      <div className="w-24 h-24 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
        <img src={assets.logo_icon} className="w-14 h-14 opacity-70" alt="" />
      </div>
      <div className="text-center max-w-sm">
        <p className="text-lg font-medium text-[var(--text-primary)]">
          Chat anytime, anywhere
        </p>
        <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
          Select a conversation from the sidebar or search for someone to start
          messaging
        </p>
      </div>
    </div>
  );
};

export default ChatContainer;
