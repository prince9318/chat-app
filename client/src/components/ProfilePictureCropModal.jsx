import { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
  });
}

export default function ProfilePictureCropModal({ imageSrc, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const croppedAreaPixelsRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const fileReaderRef = useRef(null);

  useEffect(() => {
    return () => {
      if (fileReaderRef.current) {
        try {
          fileReaderRef.current.abort();
        } catch {
          // ignore abort error on unmount
        }
        fileReaderRef.current.onloadend = null;
        fileReaderRef.current.onerror = null;
        fileReaderRef.current = null;
      }
    };
  }, []);

  const onCropComplete = useCallback((_, pixels) => {
    croppedAreaPixelsRef.current = pixels;
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixelsRef.current) return;
    setLoading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixelsRef.current);
      const reader = new FileReader();
      fileReaderRef.current = reader;
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        fileReaderRef.current = null;
        setLoading(false);
        onConfirm(reader.result);
      };
      reader.onerror = () => {
        fileReaderRef.current = null;
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [imageSrc, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="w-full max-w-md flex flex-col gap-4">
        <p className="text-center text-white font-medium">Crop your photo</p>
        <div className="relative w-full aspect-square max-h-[70vh] bg-[var(--bg-panel)] rounded-xl overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{ containerStyle: { backgroundColor: "var(--bg-panel)" } }}
          />
        </div>
        <div className="flex gap-4">
          <label className="text-sm text-[var(--text-secondary)] flex items-center gap-2 shrink-0">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              aria-label="Zoom level"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24 accent-[var(--accent)]"
            />
          </label>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-70"
          >
            {loading ? "Saving…" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
