import { colors } from "@so-doi/tokens";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import styles from "./page.module.css";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).single()
    : { data: null };

  return (
    <main className={styles.main} style={{ backgroundColor: colors.bg, color: colors.ink }}>
      <h1>Sổ Đôi</h1>
      <p style={{ color: colors.muted }}>
        {profile ? `Xin chào, ${profile.display_name}` : "Web dashboard đang được xây dựng."}
      </p>
      {user && <SignOutButton />}
    </main>
  );
}
