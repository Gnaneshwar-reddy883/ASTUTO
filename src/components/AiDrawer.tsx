import { FormEvent, useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, Send, Sparkles, X } from "lucide-react";
import { sendAiMessage } from "../services/api";

interface AiDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface ConversationMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
}

const prompts = ["Reschedule my day", "Pause my plan", "Swap this resource"];

export function AiDrawer({ open, onClose }: AiDrawerProps) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ConversationMessage[]>([
    { id: 0, role: "assistant", text: "Hi Alex. What would make today feel a little more manageable?" },
  ]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  async function submitMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError("");
    setDraft("");
    setSending(true);
    const nextId = Date.now();
    setMessages((current) => [...current, { id: nextId, role: "user", text: trimmed }]);
    try {
      const response = await sendAiMessage(trimmed);
      setMessages((current) => [...current, { id: nextId + 1, role: "assistant", text: response.reply }]);
    } catch {
      setError("I couldn’t send that just now. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage(draft);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close ASTUTO AI"
        onClick={onClose}
        className="absolute inset-0 bg-overlay"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-title"
        className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] min-h-[70dvh] flex-col rounded-t-[24px] border border-border bg-bg sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:min-h-0 sm:w-[min(440px,100vw)] sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l"
      >
        <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles size={17} />
            </span>
            <div>
              <h2 id="ai-title" className="text-sm font-semibold">ASTUTO AI</h2>
              <p className="mt-0.5 text-xs text-muted">A little help with your plan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ASTUTO AI"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border bg-surface"
                }`}
              >
                {message.text}
              </div>
            ))}
            {sending && (
              <div className="flex w-fit items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                <LoaderCircle size={15} className="animate-spin" />
                Thinking it through…
              </div>
            )}
            {error && <p role="alert" className="text-sm text-muted">{error}</p>}
          </div>
          <div className="border-t border-border bg-surface px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-4 sm:px-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {prompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  disabled={sending}
                  onClick={() => void submitMessage(prompt)}
                  className="rounded-pill border border-border bg-surface px-3 py-2 text-xs font-medium hover:bg-bg disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-pill border border-border bg-bg p-1.5 pl-4">
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={sending}
                aria-label="Message ASTUTO AI"
                placeholder="Ask for a small adjustment…"
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted"
              />
              <button type="button" aria-label="Voice input unavailable" disabled className="grid h-9 w-9 place-items-center rounded-full text-muted disabled:opacity-50">
                <Mic size={17} />
              </button>
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || sending}
                className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
