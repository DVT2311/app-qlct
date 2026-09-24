import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
  const { session, loading } = useSession();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => setDisplayName(data?.display_name ?? null));
  }, [session]);

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Sổ Đôi</ThemedText>
        <ThemedText type="subtitle" themeColor="textSecondary">
          {displayName ? `Xin chào, ${displayName}` : "App đang được xây dựng."}
        </ThemedText>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <ThemedText type="link">Đăng xuất</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
