"use client";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
export function InstallButton() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null); const [standalone, setStandalone] = useState(false);
  useEffect(() => { setStandalone(window.matchMedia("(display-mode: standalone)").matches); const register = () => navigator.serviceWorker?.register("/sw.js"); register(); const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent); }; window.addEventListener("beforeinstallprompt", onPrompt); return () => window.removeEventListener("beforeinstallprompt", onPrompt); }, []);
  if (standalone) return null;
  return <button className="quiet-button" onClick={async () => { if (prompt) { await prompt.prompt(); setPrompt(null); } else alert("Use your browser menu and choose ‘Install SelfTalk’ or ‘Add to Home Screen’."); }}><Download size={15} /> Install app</button>;
}
