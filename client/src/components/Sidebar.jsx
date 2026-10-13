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
      className={`relative flex items-center gap-3.5 px-3.5 sm:px-4 py-3 cursor-pointer transition-colors border-b border-white/[0.04] active:bg-[var(--bg-input)] ${
        isSelected
          ? "bg-[var(--bg-elevated)] text-white"
          : "hover:bg-[var(--bg-panel)]/80 text-[var(--text-primary)]"
      }`}
    >
      {isSelected && (
        <span className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--accent)] rounded-r-full" />
      )}
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

      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-semibold truncate text-[var(--text-primary)]">
            {user.fullName}
          </p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <p className="text-xs font-medium text-emerald-400/90 truncate">Online</p>
            </>
          ) : (
            <p className="text-xs text-[var(--text-muted)] truncate">Offline</p>
          )}
        </div>
      </div>

      {unseen > 0 && (
        <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#00a884] to-[#028e70] text-white text-[11px] font-bold shadow-sm shadow-emerald-950/40">
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

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".sidebar-menu-container")) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

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
      className={`h-full min-h-0 flex flex-col text-[var(--text-primary)] bg-[var(--bg-panel)] panel-divider overflow-hidden ${
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

      <div className="sidebar-header shrink-0 px-3.5 sm:px-4 py-3 bg-[var(--bg-elevated)] border-b border-white/[0.06] safe-top">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#936eff] p-1.5 flex items-center justify-center shadow-md shadow-purple-500/20">
              <img src={assets.logo_icon} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Quick<span className="text-[var(--accent)]">Chat</span>
            </span>
          </div>

          <div className="flex items-center gap-1 sidebar-menu-container relative">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-white transition-colors"
              aria-label="Profile settings"
              title="Profile settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="touch-target p-2 rounded-full hover:bg-[var(--bg-input)] text-[var(--text-secondary)] hover:text-white transition-colors"
                aria-label="Menu"
              >
                <img src={assets.menu_icon} alt="" className="w-5 h-5 opacity-80" />
              </button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 z-30 mt-1.5 w-48 py-1.5 rounded-2xl bg-[#1e2a30] border border-white/10 shadow-2xl backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => { navigate("/profile"); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-[var(--bg-input)]/90 py-2 px-3 border border-white/5 focus-within:border-[var(--accent)]/50 focus-within:ring-1 focus-within:ring-[var(--accent)]/50 transition-colors">
          <img src={assets.search_icon} alt="" className="w-4 h-4 opacity-60 shrink-0" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            value={input}
            aria-label="Search or start new chat"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
            placeholder="Search or start new chat"
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="p-1 rounded-full text-[var(--text-muted)] hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto border-t border-[var(--border-subtle)] messages-scroll overscroll-contain">
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[var(--text-muted)]">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-[var(--text-primary)] font-medium text-sm">
              {input ? "No chats found" : "No conversations yet"}
            </p>
            <p className="text-[var(--text-muted)] text-xs max-w-xs">
              {input ? `No contacts match "${input}"` : "Search above to find people and start messaging"}
            </p>
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
