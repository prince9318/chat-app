import { useContext, useEffect, useState, useMemo, memo, useCallback } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ProfileImageModal from "./ProfileImageModal";
import Avatar from "./Avatar";

const UserItem = memo(function UserItem({
  user,
  isSelected,
  unseen,
  isOnline,
  onSelect,
  onViewProfile,
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Chat with ${user.fullName}`}
      onClick={() => onSelect(user)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(user);
        }
      }}
      className={`flex items-center gap-3 px-3 sm:px-4 py-3.5 sm:py-3 cursor-pointer transition-colors border-b border-[var(--border-subtle)] active:bg-[var(--bg-input)] ${
        isSelected ? "bg-[var(--bg-input)]" : "hover:bg-[var(--bg-panel)]"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar
          src={user?.profilePic}
          name={user?.fullName}
          size="lg"
          online={isOnline}
          ringOnHover
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(user);
          }}
          lazy
        />
      </div>

      <div className="flex-1 min-w-0 py-1">
        <p className="text-[var(--text-primary)] font-medium truncate">
          {user.fullName}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">
          {isOnline ? "online" : "offline"}
        </p>
      </div>

      {unseen > 0 && (
        <span className="shrink-0 min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-[var(--accent)] text-white text-xs font-medium">
          {unseen > 99 ? "99+" : unseen}
        </span>
      )}
    </div>
  );
});

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    setUnseenMessages,
    unseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileModal, setProfileModal] = useState({
    isOpen: false,
    imageUrl: "",
    userName: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const id = setTimeout(() => setSearchInput(input), 120);
    return () => clearTimeout(id);
  }, [input]);

  const onlineSet = useMemo(() => new Set(onlineUsers), [onlineUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchInput) return users;
    const q = searchInput.toLowerCase();
    return users.filter((user) => user.fullName.toLowerCase().includes(q));
  }, [users, searchInput]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleSelectUser = useCallback(
    (user) => {
      setSelectedUser(user);
      setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
    },
    [setSelectedUser, setUnseenMessages],
  );

  const handleViewProfile = useCallback(
    (user) => {
      setProfileModal({
        isOpen: true,
        imageUrl: user?.profilePic || assets.avatar_icon,
        userName: user.fullName,
      });
    },
    [],
  );

  const closeProfileModal = useCallback(
    () => setProfileModal((prev) => ({ ...prev, isOpen: false })),
    [],
  );

  return (
    <div
      className={`h-full flex flex-col text-[var(--text-primary)] bg-[var(--bg-panel)] panel-divider ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={closeProfileModal}
        />
      )}

      <div className="sidebar-header sticky top-0 z-20 px-3 sm:px-4 py-3 bg-[var(--bg-elevated)] safe-top">
        <div className="flex justify-between items-center gap-2">
          <img src={assets.logo} alt="QuickChat" className="h-7 sm:h-8" />
          <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] transition-colors"
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
            aria-label="Search or start new chat"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            placeholder="Search or start new chat"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border-t border-[var(--border-subtle)]">
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <p className="text-[var(--text-secondary)] text-sm">
              {input ? "No chats match your search" : "No conversations yet"}
            </p>
            {!input && (
              <p className="text-[var(--text-muted)] text-xs">
                Search above to find people and start chatting
              </p>
            )}
          </div>
        )}
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const unseen = unseenMessages[user._id] || 0;
          return (
            <UserItem
              key={user._id}
              user={user}
              isSelected={isSelected}
              unseen={unseen}
              isOnline={onlineSet.has(user._id)}
              onSelect={handleSelectUser}
              onViewProfile={handleViewProfile}
            />
          );
        })}
      </div>
    </div>
  );
};

export default memo(Sidebar);
