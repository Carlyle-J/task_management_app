"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setSuccessMessage("Account created! You can now log in.");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", //this was missing, needed for JWT cookie
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // No more localStorage - JWT cookie is set automatically by the server
      router.push("/");
    } else {
      setError(data.error || "Login failed. Please try again.");
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
        <h2 className={styles.formTitle}>Welcome back</h2>
        <p className={styles.subtitle}>Log in to access your tasks</p>

        {successMessage && (
          <div className={styles.successBox}>
              {successMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className={styles.input}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
          </div>

          {error && (
            <div className={styles.errorBox}>⚠️ {error}</div>
          )}

          <button type="submit" className={styles.loginBtn} disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className={styles.switchText}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
