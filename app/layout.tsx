import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "SelfTalk", description: "A private journal that feels like texting yourself.", appleWebApp: { capable: true, title: "SelfTalk", statusBarStyle: "black-translucent" }, icons: { icon: "/icon-192.svg", apple: "/icon-192.svg" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#171a28" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
