import { cn } from "@/lib/cn";
import { HOME_FAQ } from "@/data/homePageContent";
import { useState } from "react";

export default function FAQ() {
    const [openFaq, setOpenFaq] = useState<number | null>(1);
    return (
        <section className="mx-auto max-w-4xl px-8 py-24">
        <h2 className="mb-16 text-center font-[family-name:var(--font-headline)] text-4xl font-extrabold tracking-tight">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {HOME_FAQ.map((item, i) => {
            const open = openFaq === i;
            const expandable = Boolean(item.a);
            return (
              <div
                key={item.q}
                className={cn(
                  "overflow-hidden rounded-2xl bg-surface-container",
                  open && expandable && "border-2 border-primary/20",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-8 py-6 text-left transition-colors",
                    expandable && (open ? "bg-surface-container-high" : "hover:bg-surface-container-high"),
                    !expandable && "cursor-default hover:bg-surface-container-high/50",
                  )}
                  onClick={() => {
                    if (!expandable) return;
                    setOpenFaq(open ? null : i);
                  }}
                >
                  <span className="text-lg font-bold text-foreground">{item.q}</span>
                  <span className="material-symbols-outlined text-primary">
                    {expandable && open ? "remove" : "add"}
                  </span>
                </button>
                {open && expandable && item.a ? (
                  <div className="px-8 pb-8 leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>
    );
}