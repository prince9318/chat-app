import { useEffect } from "react";

const ProfileImageModal = ({ imageUrl, onClose, userName }) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  // Close modal when clicking outside the image
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-[90%] max-h-[90%] rounded-xl overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <img
          src={imageUrl}
          alt={`${userName}'s profile`}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
        />

        {userName && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white text-lg font-medium">{userName}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileImageModal;
