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
      className={`h-full flex flex-col text-[#e9edef] ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      {/* ✅ Profile Image Modal */}
      {profileModal.isOpen && (
        <ProfileImageModal
          imageUrl={profileModal.imageUrl}
          userName={profileModal.userName}
          onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        />
      )}

      {/* ---------- Header Section ---------- */}
      <div className="sticky top-0 z-20 pb-3 bg-[#202c33] px-4 py-3 border-b border-[#202c33]">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="h-6" />
          <div className="relative">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="h-5 cursor-pointer"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            />
            {isMenuOpen && (
              <div className="absolute top-full right-0 z-20 w-36 p-3 rounded-md bg-[#111b21] border border-[#202c33] shadow-xl">
                <p
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm hover:text-green-400"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-[#202c33]" />
                <p
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="cursor-pointer text-sm hover:text-green-400"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#111b21] rounded-md flex items-center gap-2 py-2 px-3 mt-3">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-[#e9edef] text-xs placeholder-gray-400 flex-1"
            placeholder="Search or start new chat"
          />
        </div>
      </div>

      {/* ---------- User List ---------- */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user); // Set selected chat
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 })); // Reset unseen messages for that user
            }}
            key={index}
            className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer max-sm:text-sm border-b border-[#202c33] ${
              selectedUser?._id === user._id ? "bg-[#111b21]" : "hover:bg-[#111b21]"
            }`}
          >
            {/* Profile Picture (click opens modal) */}
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // Prevent selecting chat when clicking avatar
                setProfileModal({
                  isOpen: true,
                  imageUrl: user?.profilePic || assets.avatar_icon,
                  userName: user.fullName,
                });
              }}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <span className="text-[11px] text-gray-400">&nbsp;</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {onlineUsers.includes(user._id) ? (
                  <span className="text-green-400">Online</span>
                ) : (
                  <span>Offline</span>
                )}
              </div>
            </div>

            {/* ✅ Unseen message count badge */}
            {unseenMessages[user._id] > 0 && (
              <p className="text-xs h-5 w-5 flex justify-center items-center rounded-full bg-green-600 text-white font-bold">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
