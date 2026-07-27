import { type ReactNode } from "react";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/components/AuthProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
