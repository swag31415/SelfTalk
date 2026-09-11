"use client";

import { ArrowLeft, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Account = { user?: { name?: string | null; email?: string | null; image?: string | null } };

export default function SettingsPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => { void fetch("/api/auth/session", { credentials: "same-origin" }).then((response) => response.json()).then(setAccount).catch(() => setAccount(null)); }, []);
  const user = account?.user;
  return <main className="shell settings-shell"><header className="appbar"><div className="brand">Self<span>Talk</span><small>settings</small></div><button className="quiet-button" onClick={() => router.push("/")}><ArrowLeft size={16} /> Back to journal</button></header><section className="settings-card"><h1>Settings</h1><p>Keep your private journal simple and yours.</p><div className="settings-account">{user?.image ? <img src={user.image} alt="Signed-in account" /> : <span>{(user?.name || user?.email || "You").slice(0, 1).toUpperCase()}</span>}<div><b>{user?.name || "Your Google account"}</b><small>{user?.email || "Loading account…"}</small></div></div><button className="new-thread" onClick={() => void signOut({ callbackUrl: window.location.origin })}><LogOut size={18} /> Sign out</button></section></main>;
}
