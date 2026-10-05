import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
  useCallback,
} from "react";
import assets from "../assets/assets";
import { extractUrls } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { CallContext } from "../context/CallContext";
import toast from "react-hot-toast";
import ProfileImageModal from "./ProfileImageModal";
import ChatHeader from "./ChatHeader";
import ChatPreviewModal from "./ChatPreviewModal";
import ChatSharedMediaModal from "./ChatSharedMediaModal";
import ChatMessageList from "./ChatMessageList";
import ChatInputBar from "./ChatInputBar";
import ChatEmptyState from "./ChatEmptyState";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

const MAX_ATTACHMENT_SIZE_BYTES = 50 * 1024 * 1024;

const ChatContainerInner = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    sendAudioMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers, axios } = useContext(AuthContext);
  const { startCall } = useContext(CallContext);

  const scrollEnd = useRef();
  const messagesRef = useRef();

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
  const [showSharedDocs, setShowSharedDocs] = useState(false);
  const [currentDateLabel, setCurrentDateLabel] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { isRecording, toggleRecording } = useAudioRecorder(sendAudioMessage);

  const onlineSet = useMemo(() => new Set(onlineUsers), [onlineUsers]);

  const openPreview = useCallback((url, type, title) => {
    if (!url) return;
    setPreviewModal({ isOpen: true, url, type, title });
  }, []);

  const openMediaPreview = useCallback((msg) => {
    const url = msg?.image || msg?.video || msg?.audio;
    if (!url) return;

    const type = msg?.image ? "image" : msg?.video ? "video" : "audio";
    const title = msg?.image
      ? "Image preview"
      : msg?.video
        ? "Video preview"
        : "Audio preview";

    openPreview(url, type, title);
  }, [openPreview]);

  const closeProfileModal = useCallback(
    () => setProfileModal((prev) => ({ ...prev, isOpen: false })),
    [],
  );

  const closePreview = useCallback(
    () => setPreviewModal({ isOpen: false, url: "", type: "", title: "" }),
    [],
  );

  const openMessageOptions = useCallback((messageId, isOwnMessage) => {
    setMessageOptionsState({
      isOpen: true,
      messageId,
      isOwnMessage,
    });
  }, []);

  const closeMessageOptions = useCallback(
    () =>
      setMessageOptionsState({
        isOpen: false,
        messageId: null,
        isOwnMessage: false,
      }),
    [],
  );

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

  const sendAttachmentFile = useCallback(
    async (file) => {
      if (!file) {
        toast.error("No file selected");
        return;
      }
      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        toast.error("File exceeds maximum 50MB size");
        return;
      }
      const currentId = selectedUser?._id;
      if (!currentId) {
        toast.error("Select a chat first");
        return;
      }
      const fd = new FormData();
      fd.append("attachment", file);
      setIsSending(true);
      try {
        const { data } = await axios.post(
          `/api/messages/send/${currentId}`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        if (data?.success) {
          toast.success(data.message || "File sent");
          await getMessages(currentId);
        } else {
          toast.error(data?.message || "Failed to send file");
        }
      } catch (err) {
        toast.error(err?.message || "Failed to upload file");
      } finally {
        setIsSending(false);
      }
    },
    [axios, selectedUser?._id, getMessages],
  );

  const handleSendMessage = useCallback(
    async (e) => {
      e?.preventDefault?.();
      const trimmed = input.trim();
      if (!trimmed || isSending) return;
      setIsSending(true);
      try {
        const res = await sendMessage({ text: trimmed });
        if (res?.success) setInput("");
      } catch (err) {
        toast.error(err?.message || "Failed to send");
      } finally {
        setIsSending(false);
      }
    },
    [input, isSending, sendMessage],
  );

  const handleSendAttachment = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      await sendAttachmentFile(file);
      e.target.value = "";
    },
    [sendAttachmentFile],
  );

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

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

  const handleEmojiClick = useCallback((emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  }, []);

  if (!selectedUser) {
    return <ChatEmptyState />;
  }

  return (
    <div className="h-full min-h-0 relative flex flex-col bg-[var(--bg-panel)] max-md:fixed max-md:inset-0 max-md:z-30">
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={closeProfileModal}
        />
      )}

      <ChatPreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        previewModal={previewModal}
      />

      <ChatSharedMediaModal
        isOpen={showSharedDocs}
        onClose={() => setShowSharedDocs(false)}
        sharedMedia={sharedMedia}
        sharedFiles={sharedFiles}
        sharedLinks={sharedLinks}
        onOpenMediaPreview={openMediaPreview}
      />

      <ChatHeader
        selectedUser={selectedUser}
        isOnline={onlineSet.has(selectedUser._id)}
        onBack={() => setSelectedUser(null)}
        onAvatarClick={() =>
          setProfileModal({
            isOpen: true,
            imageUrl: selectedUser.profilePic || assets.avatar_icon,
            userName: selectedUser.fullName,
          })
        }
        onStartAudioCall={() => startCall(selectedUser, "audio")}
        onStartVideoCall={() => startCall(selectedUser, "video")}
        onOpenSharedMedia={() => setShowSharedDocs(true)}
      />

      <ChatMessageList
        messages={messages}
        currentUserId={authUser._id}
        messageOptionsState={messageOptionsState}
        onOpenOptions={openMessageOptions}
        onCloseOptions={closeMessageOptions}
        onOpenPreview={openPreview}
        messagesRef={messagesRef}
        scrollEndRef={scrollEnd}
        currentDateLabel={currentDateLabel}
      />

      <ChatInputBar
        input={input}
        setInput={setInput}
        isSending={isSending}
        isRecording={isRecording}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        onSendMessage={handleSendMessage}
        onSendAttachment={handleSendAttachment}
        onToggleRecording={toggleRecording}
        onEmojiClick={handleEmojiClick}
      />
    </div>
  );
};

const ChatContainer = memo(ChatContainerInner);
export default ChatContainer;
