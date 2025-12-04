import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext); // ✅ Check if a chat user is selected

  return (
    <div className="w-full h-screen px-4 py-4 md:px-8 md:py-6">
      <div
        className={`
          rounded-xl overflow-hidden h-full grid grid-cols-1 relative border border-[#202c33]
          ${
            selectedUser
              ? "md:grid-cols-[360px_minmax(0,1fr)_320px]"
              : "md:grid-cols-[360px_minmax(0,1fr)]"
          }
          bg-[#0b141a]
        `}
      >
        {/* ✅ Left Sidebar: List of users */}
        <Sidebar />

        {/* ✅ Chat Container: Main chat window */}
        <ChatContainer />

        {/* ✅ Right Sidebar: User profile + media (visible only when user is selected) */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
