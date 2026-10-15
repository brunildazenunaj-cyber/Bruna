import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Beyond Money Minds | Learn. Grow. Go Beyond.",
  description:
    "Financial education, market insights and personal growth. Explore BMM Academy in Albanian and English.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
