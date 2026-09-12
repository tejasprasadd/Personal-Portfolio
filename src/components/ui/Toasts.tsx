export type Toast = { id: number; text: string; tone?: "info" | "achievement" };

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[70] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="glass-panel pixel-corners rounded-md px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest"
          style={{
            color: t.tone === "achievement" ? "#FACC15" : "#22D3EE",
            borderColor: t.tone === "achievement" ? "#FACC1566" : "#22D3EE55",
          }}
        >
          {t.tone === "achievement" ? "★ ACHIEVEMENT UNLOCKED — " : ""}
          {t.text}
        </div>
      ))}
    </div>
  );
}
