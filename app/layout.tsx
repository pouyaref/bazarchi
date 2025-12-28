import type { Metadata, Viewport } from "next";
import "./globals.css";
import LoadingProvider from "@/components/LoadingProvider";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "بازار چی - BazaarChi",
  description: "Classified ads marketplace",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="pb-16 md:pb-0">
        <LoadingProvider>
          <AuthProvider>
            {children}
            <BottomNav />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

