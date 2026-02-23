import { Link } from "react-router-dom";

const TermsPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-app)] text-[var(--text-primary)]">
      <div className="max-w-2xl w-full space-y-6 rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Terms of use</h1>
          <Link to="/login" className="text-sm text-[var(--accent)] hover:underline">Back to login</Link>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          By creating an account or using QuickChat, you agree not to misuse the
          service, impersonate others, or share unlawful content. You must be at
          least 13 years old, and you are responsible for the content you send.
          We may suspend accounts that violate these terms.
        </p>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          QuickChat is provided on an “as is” basis. We do not guarantee uptime
          or uninterrupted service. We may update these terms from time to time.
          Continued use of QuickChat constitutes acceptance of any changes.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
