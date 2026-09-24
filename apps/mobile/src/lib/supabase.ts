import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Database } from "@so-doi/db-types";
import { largeSecureStore } from "./large-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// expo-secure-store chỉ hoạt động trên iOS/Android. Trên web dùng AsyncStorage
// (localStorage) — yêu cầu "token trong SecureStore" ở SPEC.md mục 11 áp dụng
// cho app di động, không áp dụng cho bản web (đã có web dashboard riêng).
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === "web" ? AsyncStorage : largeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
