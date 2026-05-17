"use client";

import { useState, useEffect } from "react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { cn } from "@/lib/cn";

type Props = {
  q: string;
  a: string;
  isFirst?: boolean; 
  courseId?: string;
};

export default function CourseFAQ({
  q,
  a,
  isFirst = false,
}: Props) {
  const [open, setOpen] = useState(isFirst);

  useEffect(() => {
    setOpen(isFirst);
  }, [isFirst]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  if (!q || !a) {
    return null;
  }

  return (
    <div 
      className={cn(
        "border-b border-border/30 overflow-hidden mx-4",
        open && "border-primary/10"
      )}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-6 py-4 select-none group"
        onClick={handleToggle}
      >
        <h3 className="font-headline font-bold text-foreground text-sm md:text-base group-hover:text-primary transition-colors duration-200 pr-4">
          {q}
        </h3>
        <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors p-1">
          {open ? (
            <LuChevronUp className="w-5 h-5 transition-transform duration-300 transform rotate-180 text-primary" />
          ) : (
            <LuChevronDown className="w-5 h-5 transition-transform duration-300" />
          )}
        </div>
      </div>

      {/* Answer Panel */}
      {open && (
        <div className="px-6 pb-5 pt-1 bg-muted/5 animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}