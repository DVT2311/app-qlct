"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@so-doi/tokens";
import { createClient } from "@/lib/supabase/client";

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
    <main style={{ backgroundColor: colors.bg, minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 360,
          margin: "0 auto",
          padding: "64px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1 style={{ color: colors.ink }}>Sổ Đôi</h1>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setMode("sign-in")} disabled={mode === "sign-in"}>
            Đăng nhập
          </button>
          <button type="button" onClick={() => setMode("sign-up")} disabled={mode === "sign-up"}>
            Đăng ký
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "sign-up" && (
            <input
              type="text"
              placeholder="Tên hiển thị"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p style={{ color: "#B4502A" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: colors.ink, color: "#fff" }}
          >
            {loading ? "Đang xử lý…" : mode === "sign-in" ? "Đăng nhập" : "Tạo tài khoản"}
          </button>
        </form>

        <button type="button" onClick={handleGoogleSignIn}>
          Tiếp tục với Google
        </button>
      </div>
    </main>
  );
}
