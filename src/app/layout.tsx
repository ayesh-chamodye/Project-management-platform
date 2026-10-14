import { type ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.className}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
