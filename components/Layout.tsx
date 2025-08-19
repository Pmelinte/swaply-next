// components/Layout.tsx
import { ReactNode } from "react";
import styles from "./layout.module.css";

export default function Layout({ children }: { children: ReactNode }) {
  return <main className={styles.container}>{children}</main>;
}
