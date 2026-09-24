import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { colors, radius } from "@so-doi/tokens";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/lib/supabase";

type Mode = "sign-in" | "sign-up";

export default function LoginScreen() {
  const { session, loading: sessionLoading } = useSession();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!sessionLoading && session) {
    return <Redirect href="/" />;
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);

    const { error: authError } =
      mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: email.split("@")[0] } },
          });

    setSubmitting(false);
    if (authError) {
      setError(authError.message);
    }
  }

  // Google/Apple Sign-In cần client ID/credential thật từ Google Cloud Console
  // và Apple Developer (chưa có trong môi trường này) — SPEC.md mục 3 yêu cầu
  // Sign in with Apple bắt buộc trên iOS khi có đăng nhập mạng xã hội. Nút để
  // sẵn chỗ, gắn provider thật khi có credential.
  function handleGoogleSignIn() {
    setError("Đăng nhập Google cần cấu hình OAuth client — chưa sẵn sàng trong bản dựng này.");
  }

  function handleAppleSignIn() {
    setError("Đăng nhập Apple cần cấu hình OAuth client — chưa sẵn sàng trong bản dựng này.");
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.header}>
            <ThemedText type="subtitle">Sổ Đôi</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Quản lý tài chính cùng nhau
            </ThemedText>
          </View>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, mode === "sign-in" && { backgroundColor: colors.ink }]}
              onPress={() => setMode("sign-in")}
            >
              <ThemedText
                type="smallBold"
                style={mode === "sign-in" ? styles.tabTextActive : undefined}
              >
                Đăng nhập
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === "sign-up" && { backgroundColor: colors.ink }]}
              onPress={() => setMode("sign-up")}
            >
              <ThemedText
                type="smallBold"
                style={mode === "sign-up" ? styles.tabTextActive : undefined}
              >
                Đăng ký
              </ThemedText>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            placeholderTextColor={colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error && <ThemedText style={{ color: colors.personB }}>{error}</ThemedText>}

          <Pressable
            style={[styles.button, { backgroundColor: colors.ink }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <ThemedText style={{ color: "#fff" }}>
              {submitting ? "Đang xử lý…" : mode === "sign-in" ? "Đăng nhập" : "Tạo tài khoản"}
            </ThemedText>
          </Pressable>

          <Pressable style={styles.button} onPress={handleGoogleSignIn}>
            <ThemedText>Tiếp tục với Google</ThemedText>
          </Pressable>
          <Pressable style={styles.button} onPress={handleAppleSignIn}>
            <ThemedText>Tiếp tục với Apple</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    width: "100%",
    maxWidth: 380,
    gap: 12,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: "#E4DDD0",
    padding: 24,
  },
  header: { gap: 6, marginBottom: 8 },
  tabs: {
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
    borderColor: "#E4DDD0",
    borderRadius: 12,
    padding: 4,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  tabTextActive: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#E4DDD0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    color: colors.ink,
  },
  button: {
    borderWidth: 1,
    borderColor: "#E4DDD0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
});
