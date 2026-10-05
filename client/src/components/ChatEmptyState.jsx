import assets from "../assets/assets";

const ChatEmptyState = () => (
  <div className="hidden md:flex flex-col items-center justify-center gap-6 bg-[var(--bg-app)] chat-wallpaper px-6 min-h-0 h-full">
    <div className="w-24 h-24 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
      <img src={assets.logo_icon} className="w-14 h-14 opacity-70" alt="" />
    </div>
    <div className="text-center max-w-sm">
      <p className="text-lg font-medium text-[var(--text-primary)]">
        Chat anytime, anywhere
      </p>
      <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
        Select a conversation from the sidebar or search for someone to start
        messaging
      </p>
    </div>
  </div>
);

export default ChatEmptyState;
