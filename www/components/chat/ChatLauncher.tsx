"use client";

import { useState } from "react";
import ChatPanel from "@/components/chat/ChatPanel";

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open ? <ChatPanel onClose={() => setOpen(false)} /> : null}
      <button type="button" onClick={() => setOpen((v) => !v)} className="fixed bottom-6 right-5 z-50 rounded-full bg-brand px-5 py-3 font-semibold text-white shadow-lg hover:opacity-90">
        {open ? "닫기" : "AI에게 질문하기"}
      </button>
    </>
  );
}
