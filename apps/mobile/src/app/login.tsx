import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { colors } from "@so-doi/tokens";
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
        <ThemedText type="title">Sổ Đôi</ThemedText>

        <ThemedView style={styles.tabs}>
          <Pressable onPress={() => setMode("sign-in")}>
            <ThemedText type={mode === "sign-in" ? "smallBold" : "small"}>Đăng nhập</ThemedText>
          </Pressable>
          <Pressable onPress={() => setMode("sign-up")}>
            <ThemedText type={mode === "sign-up" ? "smallBold" : "small"}>Đăng ký</ThemedText>
          </Pressable>
        </ThemedView>

        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
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
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  tabs: { flexDirection: "row", gap: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#E4DDD0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
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
