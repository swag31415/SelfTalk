import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "SelfTalk", description: "A private journal that feels like texting yourself.", appleWebApp: { capable: true, title: "SelfTalk", statusBarStyle: "black-translucent" }, icons: { icon: "/icon-192.svg", apple: "/icon-192.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
