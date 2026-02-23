import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext); // ✅ Check if a chat user is selected

  return (
    <div className="w-full h-screen flex bg-[var(--bg-app)]">
      <div
        className={`h-full grid grid-cols-1 flex-1 min-w-0 ${
          selectedUser
            ? "md:grid-cols-[min(400px,30%)_1fr_min(360px,25%)]"
            : "md:grid-cols-[min(400px,30%)_1fr]"
        }`}
      >
        <Sidebar />
        <ChatContainer />
        <RightSidebar />
      </div>
    </div>
  );
};

export default HomePage;
