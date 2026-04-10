
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTodos } from "@/hooks/useTodos";
import { useTheme } from "@/hooks/useTheme";
import AddTodo from "@/components/AddTodo";
import TodoList from "@/components/TodoList";
import styles from "./page.module.css";

interface AuthUser {
  username: string;
  role: string;
}

export default function Home() {
  const { isDark, toggleTheme } = useTheme();
  const {
    todos,
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    reorderTodos,
    activeCount,
    refetch,
  } = useTodos();

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is logged in by calling me file
  // This reads the JWT cookie on the server and returns user info
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setAuthUser({ username: data.username, role: data.role });
          // Fetch todos now that we know who the user is
          refetch();
        }
      } catch (error) {
        // Not logged in, that's fine
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuth();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setAuthUser(null);
  }

  return (
    <div className={`${styles.page} ${isDark ? styles.dark : styles.light}`}>
      <div
        className={styles.heroBg}
        style={{
          backgroundImage: isDark
            ? "url('/images/bg-desktop-dark.jpg')"
            : "url('/images/bg-desktop-light.jpg')",
        }}
      />

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>T O D O</h1>
          <div className={styles.headerRight}>
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
                  <path fill="#FFF" fillRule="evenodd" d="M13 21a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-5.657-2.343a1 1 0 010 1.414l-2.121 2.121a1 1 0 01-1.414-1.414l2.12-2.121a1 1 0 011.415 0zm12.728 0l2.121 2.121a1 1 0 01-1.414 1.414l-2.121-2.12a1 1 0 011.414-1.415zM13 8a5 5 0 110 10A5 5 0 0113 8zm12 4a1 1 0 110 2h-3a1 1 0 110-2h3zM4 12a1 1 0 110 2H1a1 1 0 110-2h3zm18.192-8.192a1 1 0 010 1.414l-2.12 2.121a1 1 0 01-1.415-1.414l2.121-2.121a1 1 0 011.414 0zm-16.97 0l2.121 2.121A1 1 0 015.93 7.343L3.808 5.222a1 1 0 011.414-1.414zM13 0a1 1 0 011 1v3a1 1 0 11-2 0V1a1 1 0 011-1z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
                  <path fill="#FFF" fillRule="evenodd" d="M13 0c.81 0 1.603.074 2.373.216C10.593 1.199 7 5.43 7 10.5 7 16.299 11.701 21 17.5 21c2.996 0 5.7-1.255 7.613-3.268C23.22 22.572 18.51 26 13 26 5.82 26 0 20.18 0 13S5.82 0 13 0z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* User bar */}
        <div className={`${styles.userBar} ${isDark ? styles.userBarDark : styles.userBarLight}`}>
          {authUser ? (
            <>
              <span className={styles.welcomeText}>
                👋 Welcome, <strong>{authUser.username}</strong>
                {authUser.role === "admin" && (
                  <span className={styles.adminBadge}>ADMIN</span>
                )}
              </span>
              <div className={styles.userActions}>
                {authUser.role === "admin" && (
                  <Link href="/admin" className={styles.adminDashboardBtn}>
                    ⚙️ Admin Dashboard
                  </Link>
                )}
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Log out
                </button>
              </div>
            </>
          ) : (
            <>
              <span className={styles.guestText}>You are browsing as a guest</span>
              <Link href="/login" className={styles.loginSignupBtn}>
                Log in / Sign up
              </Link>
            </>
          )}
        </div>

        <AddTodo isDark={isDark} onAdd={addTodo} />

        {filteredTodos.length > 0 || todos.length > 0 ? (
          <TodoList
            todos={filteredTodos}
            allTodos={todos}
            filter={filter}
            isDark={isDark}
            activeCount={activeCount}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onFilterChange={setFilter}
            onClearCompleted={clearCompleted}
            onReorder={reorderTodos}
          />
        ) : null}

        <p className={`${styles.dragHint} ${isDark ? styles.darkHint : styles.lightHint}`}>
          Drag and drop to reorder list
        </p>
      </main>
    </div>
  );
}
