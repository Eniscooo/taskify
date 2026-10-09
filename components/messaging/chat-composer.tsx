"use client";

import { ImagePlus, SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";

const QUICK_REPLIES = ["Is this still available?", "What's your last price?", "Where can we meet?"];

export function ChatComposer({
  onSend,
  showQuickReplies,
}: {
  onSend: (body: string, image?: boolean) => void;
  showQuickReplies?: boolean;
}) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    textareaRef.current?.focus();
  };

  return (
    <div className="pb-safe border-t border-border bg-surface">
      {showQuickReplies && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pt-2">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onSend(q)}
              className="h-8 shrink-0 rounded-full border border-brand/30 bg-brand-soft px-3 text-xs font-semibold text-brand-dark"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 px-3 py-2.5"
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-brand"
        >
          <ImagePlus aria-hidden className="h-5 w-5" />
          <span className="sr-only">Attach a photo</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            if (e.target.files?.length) onSend("", true);
            e.target.value = "";
          }}
        />
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <textarea
          ref={textareaRef}
          id="chat-input"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-base leading-snug focus:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none [field-sizing:content]"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-transform active:scale-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <SendHorizontal aria-hidden className="h-5 w-5" />
          <span className="sr-only">Send</span>
        </button>
      </form>
    </div>
  );
}
