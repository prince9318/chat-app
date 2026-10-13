import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const HomePage = () => {
  const { selectedUser } = useContext(ChatContext); // ✅ Check if a chat user is selected

  return (
    <div className="app-shell w-full h-full flex bg-[var(--bg-app)] overflow-hidden">
      <div
        className={`h-full w-full min-h-0 grid grid-cols-1 grid-rows-1 min-w-0 ${
          selectedUser
            ? "md:grid-cols-[minmax(280px,34%)_1fr] lg:grid-cols-[minmax(320px,28%)_1fr] xl:grid-cols-[minmax(360px,25%)_1fr]"
            : "md:grid-cols-[minmax(300px,36%)_1fr] lg:grid-cols-[minmax(340px,30%)_1fr] xl:grid-cols-[minmax(380px,26%)_1fr]"
        }`}
      >
        <Sidebar />
        <ChatContainer />
      </div>
    </div>
  );
};

export default HomePage;
