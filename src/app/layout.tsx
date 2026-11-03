import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Beyond Money Minds | Gold Group",
  description:
    "BMM Gold Group registration, Cypher AI Scanner information and manual Telegram access requests. Available in Albanian and English.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
