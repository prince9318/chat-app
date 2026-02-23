import { Link } from "react-router-dom";

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-app)] text-[var(--text-primary)]">
      <div className="max-w-2xl w-full space-y-6 rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Privacy policy</h1>
          <Link to="/login" className="text-sm text-[var(--accent)] hover:underline">Back to login</Link>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          We store your account details and messages as required to operate the
          service. Media may be processed by third-party providers. We do not
          sell personal data. You can request profile updates or deletion from
          within the app.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Data is transmitted over the internet and cannot be guaranteed to be
          completely secure. Use QuickChat at your discretion and avoid sharing
          sensitive information.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
