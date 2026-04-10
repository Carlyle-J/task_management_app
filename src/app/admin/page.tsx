/*Note to self
  -have to prevent the admin from demoting themselves
  -add icons/lil pictures maybe
*/
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./admin.module.css";

interface Stats {
  totalUsers: number;
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
  newUsersThisWeek: number;
  newTodosThisWeek: number;
  completionRate: number;
}

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  totalTodos: number;
  completedTodos: number;
  activeTodos: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleUpdateMsg, setRoleUpdateMsg] = useState("");

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    try {
      // Check if the person is logged in and stuff
      const meRes = await fetch("/api/auth/me", { credentials: "include" });

      if (!meRes.ok) {
        router.push("/login");
        return;
      }

      const meData = await meRes.json();

      if (meData.role !== "admin") {
        // ( if a user is not an admin, they are redirected to the home page)
        router.push("/");
        return;
      }

      setCurrentUser({ username: meData.username, role: meData.role });

      // Load stats and users at the same time
      const [statsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats", { credentials: "include" }),
        fetch("/api/admin/users", { credentials: "include" }),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      if (statsRes.ok) setStats(statsData);
      if (usersRes.ok) setUsers(usersData.users);

    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRoleChange(userId: string, currentRole: string, username: string) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const confirm = window.confirm(
      `Change ${username}'s role from "${currentRole}" to "${newRole}"?`
    );
    if (!confirm) return;

    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the user in the list
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setRoleUpdateMsg(` ${username}'s role changed to ${newRole}`);
        setTimeout(() => setRoleUpdateMsg(""), 3000);
      } else {
        setRoleUpdateMsg(` ${data.error}`);
        setTimeout(() => setRoleUpdateMsg(""), 3000);
      }
    } catch (err) {
      setRoleUpdateMsg(" Failed to update role");
      setTimeout(() => setRoleUpdateMsg(""), 3000);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  }

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.errorText}>{error}</p>
        <Link href="/" className={styles.backLink}>Go back home</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top navbar */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.navLogo}>T O D O</Link>
          <span className={styles.adminLabel}>Admin Dashboard</span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navUser}> {currentUser?.username}</span>
          <Link href="/" className={styles.navBtn}>← Back to App</Link>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>

        {/* Stats Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}></div>
              <div className={styles.statValue}>{stats.totalUsers}</div>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statSub}>+{stats.newUsersThisWeek} this week</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}></div>
              <div className={styles.statValue}>{stats.totalTodos}</div>
              <div className={styles.statLabel}>Total Todos</div>
              <div className={styles.statSub}>+{stats.newTodosThisWeek} this week</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}></div>
              <div className={styles.statValue}>{stats.completedTodos}</div>
              <div className={styles.statLabel}>Completed</div>
              <div className={styles.statSub}>{stats.completionRate}% completion rate</div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}></div>
              <div className={styles.statValue}>{stats.activeTodos}</div>
              <div className={styles.statLabel}>Active Todos</div>
              <div className={styles.statSub}>Still in progress</div>
            </div>
          </div>
        )}

        {/* Completion progress bar */}
        {stats && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>Overall Completion Rate</span>
              <span>{stats.completionRate}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Role update message */}
        {roleUpdateMsg && (
          <div className={`${styles.toast} ${roleUpdateMsg.startsWith("") ? styles.toastSuccess : styles.toastError}`}>
            {roleUpdateMsg}
          </div>
        )}

        {/* Users Table */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            All Users
            <span className={styles.sectionCount}>{users.length} total</span>
          </h2>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Total Todos</th>
                  <th>Completed</th>
                  <th>Active</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={u.username === currentUser?.username ? styles.currentUserRow : ""}>
                    <td>
                      <div className={styles.usernameCell}>
                        <div className={styles.avatar}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.username}</span>
                        {u.username === currentUser?.username && (
                          <span className={styles.youBadge}>You</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.emailCell}>{u.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${u.role === "admin" ? styles.adminRole : styles.userRole}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className={styles.numberCell}>{u.totalTodos}</td>
                    <td className={styles.numberCell}>
                      <span className={styles.completedNum}>{u.completedTodos}</span>
                    </td>
                    <td className={styles.numberCell}>
                      <span className={styles.activeNum}>{u.activeTodos}</span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td>
                      {u.username !== currentUser?.username ? (
                        <button
                          className={`${styles.roleBtn} ${u.role === "admin" ? styles.demoteBtn : styles.promoteBtn}`}
                          onClick={() => handleRoleChange(u.id, u.role, u.username)}
                        >
                          {u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                        </button>
                      ) : (
                        <span className={styles.noAction}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
