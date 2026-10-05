const ChatPreviewModal = ({ isOpen, onClose, previewModal }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] shadow-[var(--shadow-modal)]">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-elevated)]">
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {previewModal.title}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {previewModal.type === "file"
                ? "File preview is not available for this type."
                : `Preview ${previewModal.type}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={previewModal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-1 text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-input)]"
            >
              Open in new tab
            </a>
            <button
              type="button"
              onClick={onClose}
              className="touch-target rounded-full p-2 hover:bg-[var(--bg-input)] transition-colors"
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-auto bg-[var(--bg-panel)] p-4">
          {previewModal.type === "image" && (
            <img
              src={previewModal.url}
              alt={previewModal.title}
              className="mx-auto max-h-[70vh] w-auto rounded-[var(--radius-lg)] object-contain"
            />
          )}
          {previewModal.type === "video" && (
            <video
              controls
              src={previewModal.url}
              className="w-full rounded-[var(--radius-lg)]"
            >
              <track kind="captions" />
            </video>
          )}
          {previewModal.type === "audio" && (
            <audio controls src={previewModal.url} className="w-full">
              <track kind="captions" />
            </audio>
          )}
          {previewModal.type === "pdf" && (
            <object
              data={previewModal.url}
              type="application/pdf"
              className="w-full min-h-[60vh] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
            >
              <p className="text-sm text-[var(--text-secondary)]">
                PDF preview is not supported by your browser. Use the button
                above to open or download the file.
              </p>
            </object>
          )}
          {previewModal.type === "file" && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-app)] p-6 text-sm text-[var(--text-secondary)]">
              <p className="font-medium text-[var(--text-primary)]">
                {previewModal.title}
              </p>
              <p className="mt-2">
                This file type cannot be previewed in the app. Use the button
                above to open it in a new tab or download it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPreviewModal;
