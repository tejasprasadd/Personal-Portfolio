import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export function HoloPanel({
  title,
  subtitle,
  accent = "#587b5e",
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current,
      previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRef.current();
      }}
      className="portfolio-dialog"
    >
      <div className="glass-panel max-h-[86dvh] overflow-hidden rounded-xl text-foreground">
        <header
          className="flex items-start justify-between gap-4 border-b border-border px-6 py-5"
          style={{ background: `${accent}10` }}
        >
          <div>
            <h2 className="font-sans text-xl font-medium tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            autoFocus
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted"
          >
            <X size={18} />
          </button>
        </header>
        <div className="max-h-[70dvh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </dialog>
  );
}
