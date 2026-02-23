import { useEffect } from "react";

const ProfileImageModal = ({ imageUrl, onClose, userName }) => {
  /**
   * Close the modal when the user presses the Escape key
   */
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Attach listener when modal is mounted
    window.addEventListener("keydown", handleEscKey);
    // Clean up listener when modal is unmounted
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  /**
   * Close the modal when user clicks outside the image area
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[90%] max-h-[90%] rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-subtle)] shadow-[var(--shadow-modal)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-elevated)]/90 hover:bg-[var(--bg-input)] text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={imageUrl}
          alt={userName ? `${userName}'s profile` : "Profile"}
          className="max-w-full max-h-[80vh] object-contain"
        />
        {userName && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-white text-lg font-medium">{userName}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageModal;
