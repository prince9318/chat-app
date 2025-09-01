import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();

  const [input, setInput] = useState("");
  // const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // Handle sending an audio file
  const handleSendAudio = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("audio/")) {
      toast.error("Select a valid audio file");
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ audio: reader.result });
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // Handle sending an image
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

  // Handle sending a video
  const handleSendVideo = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("video/")) {
      toast.error("Select a valid video file");
      return;
    }

    // Check file size (limit to 50MB)
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

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add emoji to input
  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* ------- header ------- */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>
      {/* ------- chat area ------- */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}
          >
            {msg.image ? (
              <img
                src={msg.image}
                alt="img"
                className="max-w-[250px] shadow-lg rounded-xl overflow-hidden mb-8 border-2 border-purple-500/20"
              />
            ) : msg.video ? (
              <video
                controls
                src={msg.video}
                className="mb-8 max-w-[300px] rounded-xl shadow-lg border-2 border-purple-500/20"
                style={{ backgroundColor: "rgba(30, 30, 40, 0.8)" }}
              />
            ) : msg.audio ? (
              <audio
                controls
                src={msg.audio}
                className="mb-8 max-w-[250px] rounded-xl shadow-md"
                style={{ backgroundColor: "rgba(80, 70, 120, 0.4)" }}
              />
            ) : (
              <p
                className={`p-3 max-w-[250px] md:text-sm font-light rounded-xl mb-8 break-all shadow-md ${
                  msg.senderId === authUser._id
                    ? "rounded-br-none bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                    : "rounded-bl-none bg-gradient-to-r from-gray-700 to-gray-800 text-white"
                }`}
              >
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p
                className={`${
                  msg.senderId === authUser._id
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* ------- bottom area ------- */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4 backdrop-blur-md bg-black/20">
        <div className="flex-1 flex items-center bg-gray-800/50 px-4 py-2 rounded-xl shadow-inner border border-purple-500/20">
          {/* Emoji button */}
          <div className="hover:bg-purple-500/20 p-2 rounded-full transition-colors">
            <img
              src={assets.emoji_icon}
              alt="emoji"
              className="w-6 cursor-pointer"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
            />
          </div>
          {/* Emoji picker (absolute positioned above input) */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-50 shadow-xl rounded-xl overflow-hidden">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme="dark"
                width={300}
                height={400}
              />
            </div>
          )}
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            type="text"
            placeholder="Type a message"
            className="flex-1 text-sm p-3 mx-2 border-none rounded-lg outline-none bg-transparent text-white placeholder-gray-400"
          />
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
            <div className="hover:bg-purple-500/20 p-2 rounded-full transition-colors">
              <img
                src={assets.gallery_icon}
                alt="Upload media"
                className="w-5 cursor-pointer"
                style={{
                  filter: "invert(0.5) sepia(1) saturate(5) hue-rotate(175deg)",
                }}
              />
            </div>
          </label>
          <input
            onChange={handleSendAudio}
            type="file"
            id="audio"
            accept="audio/*"
            hidden
          />
          <label htmlFor="audio">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200 cursor-pointer">
              <img
                src={assets.mic_icon}
                alt="audio"
                className="w-4 h-4"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
          </label>
        </div>
        <div
          onClick={handleSendMessage}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 transition-all duration-200 cursor-pointer shadow-lg"
        >
          <img src={assets.send_button} alt="Send" className="w-5 h-5" />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
