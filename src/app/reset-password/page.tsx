"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Password reset token is invalid or has expired.");
      setValidToken(false);
      return;
    }

    fetch(`/api/auth/reset-password?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.valid) {
          setError("Password reset token is invalid or has expired.");
          setValidToken(false);
        } else {
          setValidToken(true);
        }
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Note: This is a client-side password confirmation check, not a security-sensitive
    // comparison against stored secrets, so timing attacks are not a concern here
    // eslint-disable-next-line security/detect-possible-timing-attacks
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setSuccess("Password has been reset successfully!");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // bearer:disable-next-line javascript_lang_observable_timing
  // This is a UI state check, not a security-sensitive token comparison
  if (validToken === false) {
    return (
      <div className="card w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <div className="alert-error mb-4">{error}</div>
        <Link href="/forgot-password" className="btn-primary inline-block">
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>

      {error && <div className="alert-error mb-4">{error}</div>}
      {success && <div className="alert-success mb-4">{success}</div>}

      {validToken && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="text-[var(--text-secondary)]">Loading...</div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
