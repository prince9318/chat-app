const TermsPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-[#e9edef] bg-[#0b141a]">
      <div className="max-w-3xl w-full space-y-6 border border-[#202c33] rounded-xl p-6 bg-black/20 backdrop-blur-md">
        <h1 className="text-2xl font-semibold">Terms of Use</h1>
        <p className="text-gray-300">
          By creating an account or using QuickChat, you agree not to misuse the
          service, impersonate others, or share unlawful content. You must be at
          least 13 years old, and you are responsible for the content you send.
          We may suspend accounts that violate these terms.
        </p>
        <p className="text-gray-300">
          QuickChat is provided on an “as is” basis. We do not guarantee uptime
          or uninterrupted service. We may update these terms from time to time.
          Continued use of QuickChat constitutes acceptance of any changes.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
