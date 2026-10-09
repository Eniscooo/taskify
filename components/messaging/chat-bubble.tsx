import { CheckCheck, ImageIcon } from "lucide-react";
import { formatTime } from "@/lib/formatters";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChatBubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={cn("flex animate-fade-in", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] leading-snug shadow-sm sm:max-w-[65%]",
          mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-surface text-foreground",
        )}
      >
        {message.image && (
          <div
            role="img"
            aria-label="Photo attachment"
            className={cn(
              "mb-1.5 flex aspect-[4/3] w-56 max-w-full items-center justify-center rounded-xl",
              mine ? "bg-white/15" : "bg-background",
            )}
          >
            <ImageIcon aria-hidden className="h-8 w-8 opacity-60" />
          </div>
        )}
        {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
        <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[11px]", mine ? "text-white/75" : "text-muted")}>
          <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
          {mine && (
            <>
              <CheckCheck aria-hidden className="h-3.5 w-3.5" />
              <span className="sr-only">Read</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex justify-start" role="status">
      <span className="sr-only">{name} is typing</span>
      <div aria-hidden className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 shadow-sm">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="h-2 w-2 animate-bounce rounded-full bg-muted/60"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
