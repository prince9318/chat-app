import assets from "../assets/assets";

const ChatEmptyState = () => (
  <div className="hidden md:flex flex-col items-center justify-center gap-6 bg-[var(--bg-app)] chat-wallpaper px-6 min-h-0 h-full select-none">
    <div className="relative flex flex-col items-center">
      {/* Ambient glow behind icon */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/20 via-emerald-500/20 to-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#7c3aed] to-[#936eff] p-5 flex items-center justify-center shadow-2xl shadow-purple-900/40 border border-purple-400/20">
        <img src={assets.logo_icon} className="w-full h-full object-contain drop-shadow" alt="QuickChat" />
      </div>
    </div>

    <div className="text-center max-w-md space-y-2">
      <h2 className="text-2xl font-bold tracking-tight text-white">
        Quick<span className="text-[var(--accent)]">Chat</span> for Web
      </h2>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Send instant messages, share media, and make voice or video calls with complete privacy.
      </p>
    </div>

    <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg pt-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-[var(--text-secondary)]">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        Instant Real-Time Sync
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-[var(--text-secondary)]">
        <span className="w-2 h-2 rounded-full bg-purple-400" />
        HD Audio & Video Calls
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-[var(--text-secondary)]">
        <span className="w-2 h-2 rounded-full bg-teal-400" />
        End-to-End Privacy
      </div>
    </div>

    <p className="text-xs text-[var(--text-muted)] mt-4">
      👈 Select a conversation or search contacts in the sidebar to get started
    </p>
  </div>
);

export default ChatEmptyState;
