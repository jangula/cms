import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AngulaCMS Admin",
  description: "Content Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
