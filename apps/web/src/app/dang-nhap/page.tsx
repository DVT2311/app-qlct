"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

type Mode = "sign-in" | "sign-up";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    const { error: authError } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName || email.split("@")[0] } },
          });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sổ Đôi</h1>
          <p className={styles.subtitle}>Quản lý tài chính cùng nhau</p>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === "sign-in" ? styles.tabActive : ""}`}
            onClick={() => setMode("sign-in")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === "sign-up" ? styles.tabActive : ""}`}
            onClick={() => setMode("sign-up")}
          >
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === "sign-up" && (
            <input
              className={styles.input}
              type="text"
              placeholder="Tên hiển thị"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <input
            className={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.primaryButton} disabled={loading}>
            {loading ? "Đang xử lý…" : mode === "sign-in" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>

        <div className={styles.divider}>hoặc</div>

        <button type="button" className={styles.secondaryButton} onClick={handleGoogleSignIn}>
          Tiếp tục với Google
        </button>
      </div>
    </main>
  );
}
