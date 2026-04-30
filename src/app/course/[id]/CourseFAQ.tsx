"use client";

import { Chapter } from "@/types/chapter";
import { Lesson } from "@/types/lesson";
import { useState, useEffect } from "react";
import { FaRegPlayCircle } from "react-icons/fa";
import { MdLockOutline } from "react-icons/md";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";
import { GrPlayFill } from "react-icons/gr";

type Props = {
  q: string;
  a: string;
    isFirst?: boolean; 
};

export default function CourseFAQ({
  q,
  a,
  isFirst = false,
}: Props) {
  // ✅ open only if first chapter
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
    <div className="rounded-md p-2 border-b bg-muted/30">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-foreground">
            {q}
          </h3>
        </div>

        {open ? (
          <IoChevronUp className="text-muted-foreground" />
        ) : (
          <IoChevronDown className="text-muted-foreground" />
        )}
      </div>

      {/* Lessons */}
      {open && (
        <div className="mb-2 ml-3">
            <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">
                 -- {a}
                </span>
            </div>
        </div>
      )}
    </div>
  );
}