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
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
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
      <div className="pb-5">
        <div className="flex justify-between items-center relative">
          {/* App Logo */}
          <img src={assets.logo} alt="logo" className="max-w-40" />

          {/* ✅ Dropdown Menu (Edit profile + Logout) */}
          <div className="relative py-2">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
              onClick={() => setIsMenuOpen((prev) => !prev)} // Toggle dropdown
            />

            {isMenuOpen && (
              <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                <p
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false); // Close menu
                  }}
                  className="cursor-pointer text-sm"
                >
                  Edit Profile
                </p>
                <hr className="my-2 border-t border-gray-500" />
                <p
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false); // Close menu
                  }}
                  className="cursor-pointer text-sm"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ---------- Search Bar ---------- */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* ---------- User List ---------- */}
      <div className="flex flex-col">
        {filteredUsers.map((user, index) => (
          <div
            onClick={() => {
              setSelectedUser(user); // Set selected chat
              setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 })); // Reset unseen messages for that user
            }}
            key={index}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${
              selectedUser?._id === user._id && "bg-[#282142]/50"
            }`}
          >
            {/* Profile Picture (click opens modal) */}
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              className="w-[35px] aspect-[1/1] rounded-full cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all"
              onClick={(e) => {
                e.stopPropagation(); // Prevent selecting chat when clicking avatar
                setProfileModal({
                  isOpen: true,
                  imageUrl: user?.profilePic || assets.avatar_icon,
                  userName: user.fullName,
                });
              }}
            />

            {/* User Info (name + online status) */}
            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>

            {/* ✅ Unseen message count badge */}
            {unseenMessages[user._id] > 0 && (
              <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
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
