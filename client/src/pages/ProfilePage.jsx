import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import ProfilePictureCropModal from "../components/ProfilePictureCropModal";
import Avatar from "../components/Avatar";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [fileToCrop, setFileToCrop] = useState(null);
  const [cropImageUrl, setCropImageUrl] = useState(null);
  const [croppedDataUrl, setCroppedDataUrl] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!fileToCrop) {
      setCropImageUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(fileToCrop);
    setCropImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [fileToCrop]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFileToCrop(file);
    }
    e.target.value = "";
  };

  const closeCropModal = () => {
    setFileToCrop(null);
  };

  const handleCropConfirm = (base64) => {
    setCroppedDataUrl(base64);
    closeCropModal();
  };

  const handleCropCancel = () => {
    closeCropModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!croppedDataUrl) {
        await updateProfile({ fullName: name, bio });
        navigate("/");
        return;
      }
      await updateProfile({ profilePic: croppedDataUrl, fullName: name, bio });
      navigate("/");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const profilePreviewSrc =
    croppedDataUrl || authUser?.profilePic || cropImageUrl || assets.logo_icon;

  return (
    <div className="min-h-[100dvh] w-full relative flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12 bg-[var(--bg-app)] overflow-y-auto overflow-x-hidden">
      {/* Ambient background atmosphere */}
      <div className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle 600px at 15% 20%, rgba(124, 58, 237, 0.12), transparent 70%), radial-gradient(circle 600px at 85% 80%, rgba(0, 168, 132, 0.12), transparent 70%)"
        }}
      />

      {fileToCrop && cropImageUrl && (
        <ProfilePictureCropModal
          imageSrc={cropImageUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Top back button for mobile and laptop */}
      <div className="relative z-10 w-full max-w-2xl mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-white transition-colors text-sm border border-white/5 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to chats
        </button>
      </div>

      <div className="relative z-10 w-full max-w-2xl my-auto rounded-3xl border border-white/10 bg-[#111b21]/95 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 p-6 sm:p-8 flex flex-col items-center justify-center bg-[var(--bg-elevated)]/60 border-b md:border-b-0 md:border-r border-white/[0.06]">
            <div className="relative group mb-4">
              <Avatar
                src={profilePreviewSrc}
                name={authUser.fullName}
                size="2xl"
                ring
              />
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#00a884] to-[#029676] hover:from-[#02b992] hover:to-[#00a884] cursor-pointer transition-colors shadow-lg shadow-emerald-950/40 text-white"
              >
                <span className="sr-only">Upload profile photo</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  onChange={handleFileSelect}
                  type="file"
                  id="avatar"
                  name="avatar"
                  aria-label="Upload profile photo"
                  accept=".png,.jpg,.jpeg,image/*"
                  hidden
                />
              </label>
            </div>
            <h2 className="text-lg font-bold text-white text-center">{authUser.fullName}</h2>
            {authUser.bio && <p className="text-xs text-[var(--text-secondary)] text-center mt-1.5 max-w-[220px] leading-relaxed">{authUser.bio}</p>}
          </div>

          <div className="w-full md:w-3/5 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Edit Profile</h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Customize your public display name and about info</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Full name</label>
                <input id="name" onChange={(e) => setName(e.target.value)} value={name} type="text" required placeholder="Your name" className="w-full bg-[#1e2a30]/80 border border-white/10 focus:border-[var(--accent)] focus:bg-[#202c33] focus:ring-1 focus:ring-[var(--accent)] rounded-xl py-2.5 px-3.5 text-sm text-white placeholder-[var(--text-muted)] transition-colors outline-none" />
              </div>

              <div>
                <label htmlFor="bio" className="block text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Bio</label>
                <textarea id="bio" onChange={(e) => setBio(e.target.value)} value={bio} placeholder="A short bio about yourself..." required className="w-full bg-[#1e2a30]/80 border border-white/10 focus:border-[var(--accent)] focus:bg-[#202c33] focus:ring-1 focus:ring-[var(--accent)] rounded-xl p-3.5 text-sm text-white placeholder-[var(--text-muted)] transition-colors outline-none resize-none" rows={4} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => navigate("/")} className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-white border border-white/10 text-sm font-medium transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00a884] to-[#028e70] hover:from-[#02b992] hover:to-[#00a884] text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {isLoading ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
