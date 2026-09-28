import { useEffect } from "react";

const ProfileImageModal = ({ imageUrl, onClose, userName }) => {
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col sm:flex-row items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 gap-3 sm:gap-6"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[min(92vw,92vh,520px)] max-h-[92vh] flex flex-col rounded-[var(--radius-xl)] overflow-hidden border border-white/10 shadow-2xl bg-[var(--bg-panel)]">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div className="flex-1 min-w-0">
            {userName && (
              <h3 className="text-[var(--text-primary)] text-sm sm:text-base font-semibold truncate">
                {userName}
              </h3>
            )}
            <p className="text-[var(--text-muted)] text-[11px] sm:text-xs">
              Profile picture
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors shrink-0"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-[var(--bg-app)] p-2 sm:p-4 min-h-[240px] sm:min-h-[320px]">
          <img
            src={imageUrl}
            alt={userName ? `${userName}'s profile picture` : "Profile picture"}
            draggable={false}
            className="max-w-full w-auto h-auto max-h-[75vh] sm:max-h-[70vh] object-contain rounded-[var(--radius-lg)] shadow-lg bg-[var(--bg-input)]"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileImageModal;
