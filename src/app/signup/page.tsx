
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function getPasswordStrength() {
    if (password.length === 0) return null;
    if (password.length < 4) return { label: "Weak", color: "#e74c3c", width: "33%" };
    if (password.length < 8) return { label: "Fair", color: "#f39c12", width: "66%" };
    return { label: "Strong", color: "#2ecc71", width: "100%" };
  }

  const strength = getPasswordStrength();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 5) {
      setError("Password must be at least 5 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      // call the real signup API
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to login with success message
        router.push("/login?registered=true");
      } else {
        setError(data.error || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroBg} />

      <div className={styles.card}>
        <h1 className={styles.appTitle}>T O D O</h1>
        <h2 className={styles.formTitle}>Create an account</h2>
        <p className={styles.subtitle}>Start managing your tasks today</p>

        <form onSubmit={handleSignup} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={styles.input}
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.showPasswordBtn}
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {strength && (
              <div className={styles.strengthWrapper}>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
                <span className={styles.strengthLabel} style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`${styles.input} ${
                confirmPassword && confirmPassword !== password ? styles.inputError : ""
              }`}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {confirmPassword && confirmPassword !== password && (
              <span className={styles.fieldError}>Passwords don&apos;t match</span>
            )}
          </div>

          {error && <div className={styles.errorBox}>⚠️ {error}</div>}

          <button type="submit" className={styles.signupBtn} disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <Link href="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
