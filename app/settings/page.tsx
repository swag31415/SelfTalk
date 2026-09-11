"use client";

import { ArrowDownToLine, ArrowLeft, FileUp, LogOut, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type Account = { user?: { name?: string | null; email?: string | null; image?: string | null } };

export default function SettingsPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [busy, setBusy] = useState<"export" | "import" | "delete" | null>(null);
  const [notice, setNotice] = useState("");
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => { void fetch("/api/auth/session", { credentials: "same-origin" }).then((response) => response.json()).then(setAccount).catch(() => setAccount(null)); }, []);
  const say = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2800); };
  async function exportData() { setBusy("export"); try { const response = await fetch("/api/export", { credentials: "same-origin" }); if (!response.ok) throw new Error("Couldn’t export your data."); const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = "selftalk-export.json"; link.click(); URL.revokeObjectURL(url); } catch (error) { say(error instanceof Error ? error.message : "Couldn’t export your data."); } finally { setBusy(null); } }
  async function importData(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; setBusy("import"); try { const data = JSON.parse(await file.text()); const response = await fetch("/api/import", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || "Couldn’t import chats."); say("Chats imported. Return to your journal to see them."); } catch (error) { say(error instanceof Error ? error.message : "Couldn’t import chats."); } finally { setBusy(null); } }
  async function deleteAllData() { if (!window.confirm("Delete all conversations, sides, messages, and preferences? This cannot be undone.")) return; setBusy("delete"); try { const response = await fetch("/api/data", { method: "DELETE", credentials: "same-origin" }); if (!response.ok) throw new Error("Couldn’t delete your data."); say("All journal data was deleted."); } catch (error) { say(error instanceof Error ? error.message : "Couldn’t delete your data."); } finally { setBusy(null); } }
  const user = account?.user;
  return <main className="shell settings-shell"><header className="appbar"><div className="brand">Self<span>Talk</span><small>settings</small></div><button className="quiet-button" onClick={() => router.push("/")}><ArrowLeft size={16} /> Back to journal</button></header><section className="settings-card"><h1>Settings</h1><p>Keep your private journal simple and yours.</p><div className="settings-account">{user?.image ? <img src={user.image} alt="Signed-in account" /> : <span>{(user?.name || user?.email || "You").slice(0, 1).toUpperCase()}</span>}<div><b>{user?.name || "Your Google account"}</b><small>{user?.email || "Loading account…"}</small></div></div><section className="data-controls"><h2>Your data</h2><p>Download a backup, add chats from a SelfTalk export, or permanently clear this journal.</p><button className="settings-action" disabled={busy !== null} onClick={() => void exportData()}><ArrowDownToLine size={18} /> {busy === "export" ? "Exporting…" : "Export all data"}</button><input ref={importInput} className="hidden" type="file" accept="application/json,.json" onChange={(event) => void importData(event)} /><button className="settings-action" disabled={busy !== null} onClick={() => importInput.current?.click()}><FileUp size={18} /> {busy === "import" ? "Importing…" : "Import chats"}</button><button className="settings-action danger" disabled={busy !== null} onClick={() => void deleteAllData()}><Trash2 size={18} /> {busy === "delete" ? "Deleting…" : "Delete all data"}</button></section><button className="new-thread" onClick={() => void signOut({ callbackUrl: window.location.origin })}><LogOut size={18} /> Sign out</button>{notice && <p className="toast">{notice}</p>}</section></main>;
}
