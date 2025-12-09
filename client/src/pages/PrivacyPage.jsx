const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-[#e9edef] bg-[#0b141a]">
      <div className="max-w-3xl w-full space-y-6 border border-[#202c33] rounded-xl p-6 bg-black/20 backdrop-blur-md">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="text-gray-300">
          We store your account details and messages as required to operate the
          service. Media may be processed by third-party providers. We do not
          sell personal data. You can request profile updates or deletion from
          within the app.
        </p>
        <p className="text-gray-300">
          Data is transmitted over the internet and cannot be guaranteed to be
          completely secure. Use QuickChat at your discretion and avoid sharing
          sensitive information.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
