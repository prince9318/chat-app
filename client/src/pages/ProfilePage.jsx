import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!selectedImg) {
        await updateProfile({ fullName: name, bio });
        navigate("/");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        const base64Image = reader.result;
        await updateProfile({ profilePic: base64Image, fullName: name, bio });
        navigate("/");
      };
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl backdrop-blur-xl bg-black/20 text-gray-200 border-2 border-gray-600 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Profile Image Section */}
          <div className="w-full md:w-2/5 p-6 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/40 to-violet-800/30">
            <div className="relative group mb-4">
              <img
                className="w-40 h-40 object-cover rounded-full border-4 border-violet-500/50 shadow-lg transition-all duration-300 group-hover:scale-105"
                src={
                  selectedImg
                    ? URL.createObjectURL(selectedImg)
                    : authUser?.profilePic || assets.logo_icon
                }
                alt="Profile"
              />
              <label
                htmlFor="avatar"
                className="absolute bottom-0 right-0 bg-violet-600 hover:bg-violet-700 p-2 rounded-full cursor-pointer shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  onChange={(e) => setSelectedImg(e.target.files[0])}
                  type="file"
                  id="avatar"
                  accept=".png, .jpg, .jpeg"
                  hidden
                />
              </label>
            </div>
            <h2 className="text-xl font-semibold text-white mb-1 text-center">
              {authUser.fullName}
            </h2>
            <p className="text-gray-300 text-sm text-center max-w-xs">
              {authUser.bio}
            </p>
          </div>

          {/* Form Section */}
          <div className="w-full md:w-3/5 p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="text-xl font-semibold mb-2">Edit Profile</h3>

              <div className="space-y-1">
                <label htmlFor="name" className="text-sm text-gray-300">
                  Full Name
                </label>
                <input
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="bio" className="text-sm text-gray-300">
                  Bio
                </label>
                <textarea
                  id="bio"
                  onChange={(e) => setBio(e.target.value)}
                  value={bio}
                  placeholder="Write profile bio"
                  required
                  className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all resize-none"
                  rows={4}
                ></textarea>
              </div>

              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg shadow-lg transition-all ${
                    isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
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
