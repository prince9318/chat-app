import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileImageModal from "./ProfileImageModal";

const Sidebar = () => {
  // ✅ Chat context: user list, selected user, unseen messages
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  // ✅ Auth context: logout + online user tracking
  const { logout, onlineUsers } = useContext(AuthContext);

  // ✅ Local state
  const [input, setInput] = useState(""); // Search input
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Toggle menu (edit profile/logout)
  const [profileModal, setProfileModal] = useState({
    isOpen: false, // Profile modal visibility
    imageUrl: "", // Selected profile image
    userName: "", // Selected username
  });

  const navigate = useNavigate();

  // ✅ Filter users based on search input
  const filteredUsers = input
    ? users.filter((user) =>
        user.fullName.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  // ✅ Fetch user list when component mounts
  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div
      className={`h-full flex flex-col text-[var(--text-primary)] bg-[var(--bg-panel)] ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        />
      )}

      {/* Header - WhatsApp Web style */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-[var(--bg-elevated)]">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="QuickChat" className="h-8" />
          <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
                aria-label="Menu"
              >
                <img src={assets.menu_icon} alt="" className="w-5 h-5 opacity-90" />
              </button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 z-20 mt-1 w-44 py-1 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-modal)]">
                  <button
                    type="button"
                    onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-colors"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-input)] transition-colors"
                  >
                    Log out
                  </button>
                </div>
              )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-lg bg-[var(--bg-input)] py-2 px-3">
          <img src={assets.search_icon} alt="" className="w-4 h-4 opacity-60 shrink-0" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            value={input}
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            placeholder="Search or start new chat"
          />
        </div>
      </div>

      {/* Chat list - WhatsApp Web style */}
      <div className="flex-1 overflow-y-auto border-t border-[var(--border-subtle)]">
        {filteredUsers.map((user, index) => {
          const isSelected = selectedUser?._id === user._id;
          const unseen = unseenMessages[user._id] || 0;
          return (
            <div
              onClick={() => {
                setSelectedUser(user);
                setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
              }}
              key={user._id || index}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[var(--border-subtle)] ${
                isSelected ? "bg-[var(--bg-input)]" : "hover:bg-[var(--bg-panel)]"
              }`}
            >
              <div className="relative shrink-0">
                <img
                  src={user?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileModal({
                      isOpen: true,
                      imageUrl: user?.profilePic || assets.avatar_icon,
                      userName: user.fullName,
                    });
                  }}
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--bg-panel)]" />
                )}
              </div>

              <div className="flex-1 min-w-0 py-1">
                <p className="text-[var(--text-primary)] font-medium truncate">
                  {user.fullName}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {onlineUsers.includes(user._id) ? "online" : "offline"}
                </p>
              </div>

              {unseen > 0 && (
                <span className="shrink-0 min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs font-medium">
                  {unseen > 99 ? "99+" : unseen}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
