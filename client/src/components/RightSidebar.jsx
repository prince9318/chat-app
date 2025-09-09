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
    selectedUser && ( // Show sidebar only when a user is selected
      <div
        className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${
          selectedUser ? "max-md:hidden" : ""
        }`}
      >
        {/* Profile Image Modal */}
        {profileModal.isOpen && (
          <ProfileImageModal
            imageUrl={profileModal.imageUrl}
            userName={profileModal.userName}
            onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
          />
        )}

        {/* User Profile Section */}
        <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
          {/* Profile Picture (clickable -> opens modal) */}
          <img
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
            className="w-20 aspect-[1/1] rounded-full cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all"
            onClick={() =>
              setProfileModal({
                isOpen: true,
                imageUrl: selectedUser?.profilePic || assets.avatar_icon,
                userName: selectedUser.fullName,
              })
            }
          />

          {/* Username + Online Indicator */}
          <div className="flex items-center justify-center gap-2">
            {onlineUsers.includes(selectedUser._id) && (
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            )}
            <h1 className="text-xl font-medium">{selectedUser.fullName}</h1>
          </div>

          {/* User Bio */}
          <p className="px-10 mx-auto text-center">{selectedUser.bio}</p>
        </div>

        <hr className="border-[#ffffff50] my-4" />

        {/* Media Section (shows all shared images) */}
        <div className="px-5 text-xs">
          <p>Media</p>
          <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80">
            {msgImages.map((url, index) => (
              <div
                key={index}
                onClick={() => window.open(url)} // Open image in new tab
                className="cursor-pointer rounded"
              >
                <img src={url} alt="" className="h-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer"
        >
          Logout
        </button>
      </div>
    )
  );
};

export default RightSidebar;
