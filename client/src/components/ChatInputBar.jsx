import EmojiPicker from "emoji-picker-react";

const ChatInputBar = ({
  input,
  setInput,
  isSending,
  isRecording,
  showEmojiPicker,
  setShowEmojiPicker,
  onSendMessage,
  onSendAttachment,
  onToggleRecording,
  onEmojiClick,
}) => {
  const hasMessageText = input.trim().length > 0;

  return (
    <div className="chat-composer shrink-0 px-2.5 sm:px-4 py-2 sm:py-3 bg-[var(--bg-elevated)] border-t border-white/[0.06] safe-bottom">
      <div className="flex items-center gap-2 sm:gap-2.5 max-w-5xl mx-auto">
        {/* Main input capsule */}
        <div className="flex-1 flex items-center gap-1 sm:gap-2 bg-[var(--bg-input)]/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[1.35rem] min-h-[46px] sm:min-h-[50px] border border-white/5 shadow-sm focus-within:border-[var(--accent)]/40 transition-colors">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-[var(--text-secondary)] hover:text-amber-300 transition-colors shrink-0"
            aria-label="Emoji"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-3.5-8a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 8.5 12zm7 0a1.5 1.5 0 1 1 .001-3.001A1.5 1.5 0 0 1 15.5 12zm-.194 3.75c.627-.779.944-1.733.944-2.75h-2c0 .572-.146 1.103-.395 1.558-.302.545-.75.996-1.295 1.295-.455.249-.986.395-1.558.395s-1.103-.146-1.558-.395a3.229 3.229 0 0 1-1.295-1.295A3.224 3.224 0 0 1 7.75 13h-2c0 1.017.317 1.971.944 2.75.627.779 1.487 1.379 2.498 1.692 1.011.313 2.099.313 3.11 0 1.011-.313 1.871-.913 2.498-1.692z" />
            </svg>
          </button>

          {showEmojiPicker && (
            <div className="fixed sm:absolute bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-20 left-2 right-2 sm:left-4 sm:right-auto z-50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl max-w-[min(100vw-1rem,340px)] mx-auto sm:mx-0">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme="dark"
                width="100%"
                height={330}
              />
            </div>
          )}

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) =>
              e.key === "Enter" ? onSendMessage(e) : null
            }
            type="text"
            aria-label="Type a message or paste a link"
            placeholder="Type a message..."
            className="flex-1 min-w-0 text-sm sm:text-[15px] px-1 py-2 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />

          <input
            onChange={onSendAttachment}
            type="file"
            id="attachment"
            name="attachment"
            aria-label="Attach file"
            accept="*/*"
            hidden
          />
          <label
            htmlFor="attachment"
            className="touch-target w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer transition-colors text-[var(--text-secondary)] hover:text-white shrink-0"
            title="Attach file"
          >
            <span className="sr-only">Attach file</span>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M16.5 6.5l-7.793 7.793a3 3 0 104.243 4.243l8.132-8.132a5 5 0 10-7.071-7.071L5.879 11.464a7 7 0 109.9 9.9l6.01-6.01"
              />
            </svg>
          </label>
        </div>

        {/* Dedicated circular action button */}
        {hasMessageText ? (
          <button
            type="button"
            onClick={onSendMessage}
            disabled={isSending}
            className="touch-target w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#00a884] to-[#029676] hover:from-[#02b992] hover:to-[#00a884] text-white shadow-lg shadow-emerald-950/40 active:scale-95 transition-colors shrink-0 cursor-pointer disabled:opacity-60"
            aria-label="Send message"
            title="Send"
          >
            <svg
              className="w-5 h-5 translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleRecording}
            className={`touch-target w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-colors shrink-0 cursor-pointer shadow-md ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-[var(--accent)]/15 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white"
            }`}
            aria-label={
              isRecording ? "Stop recording" : "Record voice message"
            }
            title={
              isRecording
                ? "Stop and send voice message"
                : "Record voice message"
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInputBar;
