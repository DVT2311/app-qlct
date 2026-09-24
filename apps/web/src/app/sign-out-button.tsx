"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dang-nhap");
    router.refresh();
  }

  return (
    <button type="button" className={styles.signOut} onClick={handleSignOut}>
      Đăng xuất
    </button>
  );
}
