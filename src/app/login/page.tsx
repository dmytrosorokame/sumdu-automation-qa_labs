"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const errorParam = searchParams.get("error");

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "The username is required and cannot be empty";
    }
    if (!formData.password) {
      newErrors.password = "The Password is required and cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return formData.username.trim() && formData.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ form: "Invalid username/password, Try again!" });
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setErrors({ form: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Welcome Back</h1>

      {(errors.form || errorParam) && (
        <div className="alert-error mb-4">
          {errors.form ||
            (errorParam === "SessionRequired"
              ? "You must be logged in first!"
              : "Invalid username/password, Try again!")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="input-field"
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="text-red-400 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="input-field"
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm link">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={!isFormValid() || loading}
          className="btn-primary w-full"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-center text-[var(--text-secondary)] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="link">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="text-[var(--text-secondary)]">Loading...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
