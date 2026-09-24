"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/dang-nhap");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleSignOut}>
      Đăng xuất
    </button>
  );
}
