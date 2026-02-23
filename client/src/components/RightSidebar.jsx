import { useContext, useEffect, useState } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import ProfileImageModal from "./ProfileImageModal";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext); // Selected user + chat messages
  const { logout, onlineUsers } = useContext(AuthContext); // Auth actions + online status
  const [msgImages, setMsgImages] = useState([]); // Stores images shared in the chat
  const [profileModal, setProfileModal] = useState({
    isOpen: false, // Controls modal visibility
    imageUrl: "", // Holds the clicked profile image
    userName: "", // Holds the username for modal display
  });

  /**
   * Extract images from messages and update state whenever
   * the message list changes
   */
  useEffect(() => {
    setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
  }, [messages]);

  return (
    selectedUser && (
      <div
        className={`text-[var(--text-primary)] w-full flex flex-col max-md:hidden bg-[var(--bg-panel)] border-l border-[var(--border-subtle)] overflow-hidden`}
      >
        {profileModal.isOpen && (
          <ProfileImageModal
            imageUrl={profileModal.imageUrl}
            userName={profileModal.userName}
            onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
          />
        )}

        <div className="flex-1 overflow-y-auto bg-[var(--bg-elevated)]">
          <div className="pt-10 pb-6 flex flex-col items-center px-6">
            <button
              type="button"
              onClick={() =>
                setProfileModal({
                  isOpen: true,
                  imageUrl: selectedUser?.profilePic || assets.avatar_icon,
                  userName: selectedUser.fullName,
                })
              }
              className="rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <img
                src={selectedUser?.profilePic || assets.avatar_icon}
                alt=""
                className="w-28 h-28 rounded-full object-cover"
              />
            </button>
            <h1 className="text-xl font-medium text-[var(--text-primary)] text-center">
              {selectedUser.fullName}
            </h1>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {onlineUsers.includes(selectedUser._id) ? "online" : "offline"}
            </p>
            {selectedUser.bio && (
              <p className="mt-4 text-sm text-[var(--text-secondary)] text-center max-w-[260px]">
                {selectedUser.bio}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--border-subtle)] px-4 py-4">
            <p className="text-sm text-[var(--text-muted)] mb-3 px-2">
              Media, links and docs
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[240px] overflow-y-auto">
              {msgImages.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => window.open(url, "_blank")}
                  className="aspect-square rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)] hover:opacity-90 transition-opacity focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full py-2.5 rounded-[var(--radius-md)] bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] text-sm text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
          >
            Log out
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;
