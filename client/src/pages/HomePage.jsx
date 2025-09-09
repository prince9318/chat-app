import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext); // ✅ Check if a chat user is selected

  return (
    <div className="border w-full h-screen sm:px-[15%] sm:py-[5%]">
      <div
        className={`
          backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden 
          h-[100%] grid grid-cols-1 relative
          ${
            // ✅ Layout adapts based on whether a user is selected
            selectedUser
              ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]" // Show all 3 columns (sidebar, chat, right sidebar)
              : "md:grid-cols-2" // Show only sidebar + chat (hide right sidebar)
          }
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
