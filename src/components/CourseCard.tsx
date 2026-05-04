'use client';

import { cn } from '@/lib/cn';
import Image from 'next/image';
import PrimaryActionBtn from './ui/buttons/PrimaryActionBtn';
import { useRouter } from 'next/navigation';

export default function CourseCard({ 
  course, 
  index, 
  list = false 
}: { 
  course: any, 
  index: number, 
  list?: boolean 
}) {
  const router = useRouter();
  
  const rawHref = typeof course?.href === "string" ? course.href : "";
  const targetHref =
    rawHref.startsWith("/course/") || rawHref.startsWith("/courses")
      ? rawHref
      : rawHref.startsWith("/")
        ? `/course${rawHref}`
        : rawHref
          ? `/course/${rawHref}`
          : "/courses";

  return (
    <div
      key={index}
      className={cn(
        "group flex gap-4 md:gap-6 rounded-lg bg-surface-container p-4 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-primary/40",
        list ? "flex-row items-center" : "flex-col justify-between"
      )}
    >
      {/* Image Section */}
      <div className={cn(
        "relative overflow-hidden rounded-lg shrink-0",
        list ? "h-32 w-42 md:h-52 md:w-68" : "h-56 w-full"
      )}>
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <span
          className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-tighter md:left-4 md:top-4 md:px-3 md:py-1.5 md:text-xs",
            course.badgeClass,
          )}
        >
          {course.badge}
        </span>
      </div>

      {/* Content Wrapper */}
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="text-xl font-extrabold text-foreground">
          {course.title}
        </h3>
        
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.description}
        </p>

        <div className={cn(`flex ${list? 'flex-col items-start gap-2':'flex-row items-center'} justify-between border-t border-outline-variant/20 pt-2 mt-auto`)}>
          <span className="text-2xl font-black text-primary">
            <span className='text-3xl mr-1'>৳</span>
            {course.price}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <span className="material-symbols-outlined text-base">
              play_lesson
            </span>
            {course.lessons} Lessons
          </span>
        </div>

        <div className={cn("mt-2", list ? "w-fit px-2" : "w-full")}>
          <PrimaryActionBtn 
            handleBtn={() => router.push(targetHref)} 
            value="Enroll Course" 
          />
        </div>
      </div>
    </div>
  );
}