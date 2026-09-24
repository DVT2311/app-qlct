import { colors } from "@so-doi/tokens";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main} style={{ backgroundColor: colors.bg, color: colors.ink }}>
      <h1>Sổ Đôi</h1>
      <p style={{ color: colors.muted }}>Web dashboard đang được xây dựng.</p>
    </main>
  );
}
