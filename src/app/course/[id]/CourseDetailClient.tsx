"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LuBookOpen,
  LuUsers,
  LuStar,
  LuLinkedin,
  LuTwitter,
  LuGlobe,
  LuChartBar,
  LuCirclePlay,
  LuLayers,
  LuLanguages,
  LuCircleCheck,
  LuLock,
  LuChevronDown,
  LuChevronUp,
  LuMaximize,
  LuMinimize,
  LuX,
} from "react-icons/lu";
import {
  addToCart,
  fetchCourseBundle,
  useAppDispatch,
  useAppSelector,
} from "@/store";
import { getMyEnrollments } from "@/lib/api/enrollmentClient";
import Image from "next/image";
import CourseFAQ from "./CourseFAQ";
import PrimaryActionBtn from "@/components/ui/buttons/PrimaryActionBtn";
import PrimaryOutLineBtn from "@/components/ui/buttons/PrimaryOutLineBtn";
import { useCheckout } from "@/hooks/useCheckout";
import { CourseDetailSkeleton } from "@/components/skeletons/CourseDetailSkeleton";

const SECTIONS = ["about", "instructor", "curriculum", "faq"] as const;

export function CourseDetailClient({ courseId }: { courseId: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { handleCheckout, isPending } = useCheckout();
  const { status, error, course, chapters, lessons, faqs, courseId: loadedCourseId } =
    useAppSelector((s) => s.courseDetail);
  const { isAuthenticated, user: authUser } = useAppSelector((s) => s.auth);
  
  const [activeSection, setActiveSection] = useState<string>("about");
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [activeModal, setActiveModal] = useState<"login" | "video" | "enroll" | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [isFullscreenVideo, setIsFullscreenVideo] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const instructor = useMemo(() => {
    if (!course) return null;
    if (course.instructor?._id) return course.instructor;
    const fallback = course.createdBy;
    if (!fallback?._id) return null;
    return {
      _id: fallback._id,
      name: fallback.name,
      role: fallback.role,
      email: fallback.email,
    };
  }, [course]);

  useEffect(() => {
    if (status === "idle" || loadedCourseId !== courseId) {
      dispatch(fetchCourseBundle(courseId));
    }
  }, [dispatch, courseId, status, loadedCourseId]);

  useEffect(() => {
    if (chapters.length > 0) {
      setExpandedChapters({ [chapters[0]._id]: true });
    }
  }, [chapters]);

  useEffect(() => {
    if (isAuthenticated && authUser?.role === "student") {
      getMyEnrollments()
        .then((res) => {
          const enrolled = res.data.enrollments.some(
            (e) =>
              String(e.course) === String(courseId) &&
              ["enrolled", "in_progress", "completed"].includes(String(e.status).toLowerCase())
          );
          setIsEnrolled(enrolled);
        })
        .catch((err) => {
          console.error("Error fetching enrollments:", err);
          setIsEnrolled(false);
        });
    } else if (isAuthenticated && (authUser?.role === "admin" || authUser?.role === "instructor")) {
      setIsEnrolled(true);
    } else {
      setIsEnrolled(false);
    }
  }, [isAuthenticated, authUser, courseId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const getChapterDuration = (chId: string) => {
    const chLessons = lessonsByChapter.get(chId) ?? [];
    const totalMin = chLessons.reduce((sum, l) => sum + (l.duration || l.videoDuration || 0), 0);
    if (totalMin === 0) return "";
    const hours = Math.floor(totalMin / 60);
    const mins = Math.round(totalMin % 60);
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatLessonDuration = (min?: number) => {
    if (!min) return "00:00";
    const mins = Math.floor(min);
    const secs = Math.round((min - mins) * 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleLessonClick = (lesson: any) => {
    if (lesson.isFree) {
      if (!isAuthenticated) {
        setSelectedLesson(lesson);
        setActiveModal("login");
      } else {
        setSelectedLesson(lesson);
        setActiveModal("video");
      }
    } else {
      if (!isAuthenticated) {
        setSelectedLesson(lesson);
        setActiveModal("login");
      } else if (!isEnrolled) {
        setSelectedLesson(lesson);
        setActiveModal("enroll");
      } else {
        router.push(`/student/courses/${courseId}`);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Find which section is currently active
      // Using an offset for sticky headers (approx 160px)
      const scrollPosition = window.scrollY + 170;

      let currentSection = "about";
      for (const sectionId of SECTIONS) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentSection = sectionId;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run initially
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const lessonsByChapter = useMemo(() => {
    const map = new Map<string, typeof lessons>();
    for (const ch of chapters) {
      map.set(
        ch._id,
        lessons
          .filter((l) => l.chapter === ch._id)
          .sort((a, b) => a.order - b.order),
      );
    }
    return map;
  }, [chapters, lessons]);

  const handleAddToCart = () => {
    if (!course) return;
    dispatch(
      addToCart({
        courseId: course._id,
        title: course.title,
        finalPrice: course.finalPrice,
        isPaid: course.isPaid,
      }),
    );
    // router.push("/cart");
  };

  if ((status === "loading" || status === "idle") && !course) {
    return <CourseDetailSkeleton />;
  }

  if (status === "failed") {
    return (
      <div
        className="rounded-xl border border-destructive/40 bg-error-container/40 p-8 text-on-error-container"
        role="alert"
      >
        <p className="font-semibold">Could not load this course</p>
        <p className="mt-2 text-sm">{error}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
            onClick={() => dispatch(fetchCourseBundle(courseId))}
          >
            Retry
          </button>
          <Link
            href="/courses"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground"
          >
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div
        className="rounded-xl border border-border bg-card p-8"
        role="status"
        aria-live="polite"
      >
        <p className="font-semibold text-foreground">Course not found.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This course may be unavailable right now.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-block rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground"
        >
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
          {course.difficulty ?? "Course"}
        </p>
        <h1 className="mt-2 font-headline text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          {course.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {course.shortDescription}
        </p>

        {/* Sticky Mini-Navbar */}
        <div className="sticky top-[76px] md:top-[92px] z-40 my-6 border-b border-border/60 bg-background/95 pt-4 py-1 rounded-sm shadow-sm backdrop-blur-md">
          <nav className="flex justify-around items-center gap-8 overflow-x-auto scrollbar-hide">
            {SECTIONS.map((sectionId) => {
              const label = sectionId === "faq" ? "FAQ" : sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
              const active = activeSection === sectionId;
              return (
                <button
                  key={sectionId}
                  onClick={() => scrollToSection(sectionId)}
                  className={cn(
                    "relative pb-3 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer",
                    active
                      ? "text-primary border-b-2 border-primary -mb-[2px]"
                      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent -mb-[2px]",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* About Section Wrapper */}
        <section id="about" className="scroll-mt-[140px] md:scroll-mt-[160px] mt-8">
          <h2 className="font-headline text-2xl font-bold text-foreground mb-6">
            About This Course
          </h2>
          
          {/* Description */}
          {course.description ? (
            <div 
              className="prose max-w-none text-muted-foreground text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          ) : course.shortDescription ? (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {course.shortDescription}
            </p>
          ) : (
            <p className="text-muted-foreground text-sm leading-relaxed italic">
              No description available for this course.
            </p>
          )}

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 p-4 rounded-md bg-surface border border-border/40 shadow-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Difficulty</span>
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                <LuChartBar className="w-4 h-4 text-primary" />
                <span className="capitalize">{course.difficulty ?? "All Levels"}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Lessons</span>
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                <LuCirclePlay className="w-4 h-4 text-primary" />
                <span>{lessons.length || course.lessonCount || 0} Lessons</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Chapters</span>
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                <LuLayers className="w-4 h-4 text-primary" />
                <span>{chapters.length} Chapters</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Language</span>
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-sm">
                <LuLanguages className="w-4 h-4 text-primary" />
                <span>{(course as any).language ?? "English"}</span>
              </div>
            </div>
          </div>

          {/* What you will learn */}
          {/* <div className="mt-8 pt-8 border-t border-border/40">
            <h3 className="font-headline text-lg font-bold text-foreground mb-4">
              What you&apos;ll learn
            </h3>
            {(course as any).highlights && (course as any).highlights.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(course as any).highlights.map((highlight: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <LuCircleCheck className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (course as any).objectives && (course as any).objectives.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(course as any).objectives.map((objective: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <LuCircleCheck className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-border/40 bg-surface/50 p-4 text-center">
                <p className="text-sm text-muted-foreground italic">
                  No specific learning objectives have been listed for this course yet.
                </p>
              </div>
            )}
          </div> */}
        </section>

        {/* Instructor Section Wrapper */}
        <section id="instructor" className="scroll-mt-[140px] md:scroll-mt-[160px] mt-12">
          <h2 className="font-headline text-2xl font-bold text-foreground mb-6">
            Instructor
          </h2>
          {instructor ? (
            <div className="rounded-md border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center">
                  {instructor.avatar ? (
                    <Image
                      src={instructor.avatar}
                      alt={instructor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {instructor.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-foreground">
                    {instructor.name}
                  </h3>
                  <p className="text-sm font-semibold text-primary mt-1">
                    {instructor.specialization || instructor.role || "Instructor"}
                  </p>
                  {instructor.experience && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {instructor.experience}
                    </p>
                  )}
                </div>
              </div>

              {instructor.bio && (
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {instructor.bio}
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LuBookOpen className="text-primary w-4 h-4" />
                    <span>{instructor.coursesCount ?? 0} Courses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LuUsers className="text-primary w-4 h-4" />
                    <span>{instructor.studentsCount ?? 0} Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LuStar className="text-secondary w-4 h-4 fill-secondary" />
                    <span>{(instructor.rating ?? 0).toFixed(1)} Rating</span>
                  </div>
                </div>

                {/* Social Links */}
                {instructor.socialLinks && (
                  <div className="flex items-center gap-3">
                    {instructor.socialLinks.linkedin && (
                      <a
                        href={instructor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-surface border border-border/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        title="LinkedIn"
                      >
                        <LuLinkedin className="w-4 h-4" />
                      </a>
                    )}
                    {instructor.socialLinks.twitter && (
                      <a
                        href={instructor.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-surface border border-border/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Twitter"
                      >
                        <LuTwitter className="w-4 h-4" />
                      </a>
                    )}
                    {instructor.socialLinks.website && (
                      <a
                        href={instructor.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-surface border border-border/50 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        title="Website"
                      >
                        <LuGlobe className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Instructor profile is not available.</p>
          )}
        </section>

        {/* Curriculum Section Wrapper */}
        <section id="curriculum" className="scroll-mt-[140px] md:scroll-mt-[160px] mt-12">
          <h2 className="font-headline text-2xl font-bold text-foreground mb-6">
            Curriculum
          </h2>
          {chapters.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Detailed curriculum will appear once chapter/lesson public APIs are
              connected.
            </p>
          ) : (
            <div className="rounded-md border border-border/80 overflow-hidden shadow-sm">
              {chapters.map((chapter) => {
                const isExpanded = !!expandedChapters[chapter._id];
                const chapterLessons = lessonsByChapter.get(chapter._id) ?? [];
                const durationText = getChapterDuration(chapter._id);

                return (
                  <div key={chapter._id} className="border-b border-border/60 last:border-b-0">
                    {/* Chapter Header Accordion */}
                    <div
                      onClick={() => toggleChapter(chapter._id)}
                      className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 cursor-pointer select-none transition-colors duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                        <h3 className="font-headline font-bold text-foreground text-base truncate">
                          {chapter.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
                          <span>{chapterLessons.length} Lessons</span>
                          {durationText && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                              <span>{durationText}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                        {isExpanded ? (
                          <LuChevronUp className="w-5 h-5" />
                        ) : (
                          <LuChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>

                    {/* Chapter Lessons */}
                    {isExpanded && (
                      <div className="p-4 bg-card border-t border-border/40 animate-in slide-in-from-top-2 duration-200">
                        {chapterLessons.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic p-2">
                            No lessons listed under this chapter yet.
                          </p>
                        ) : (
                          chapterLessons.map((lesson) => {
                            const isFreeLesson = !!lesson.isFree;
                            const showPlayButton = isFreeLesson || isEnrolled;

                            return (
                              <div
                                key={lesson._id}
                                onClick={() => handleLessonClick(lesson)}
                                className="flex items-center justify-between p-3 rounded-md hover:bg-muted/20 transition-all cursor-pointer select-none group border border-transparent hover:border-border/40 mb-1 last:mb-0"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {showPlayButton ? (
                                    <LuCirclePlay className="w-5 h-5 text-primary shrink-0 group-hover:scale-110 transition-transform duration-200" />
                                  ) : (
                                    <LuLock className="w-5 h-5 text-muted-foreground shrink-0" />
                                  )}
                                  <span className="text-sm font-semibold text-foreground/90 group-hover:text-primary transition-colors duration-200 truncate">
                                    {lesson.title}
                                  </span>
                                  {isFreeLesson && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-tertiary/10 text-tertiary uppercase tracking-wider shrink-0">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground/80 shrink-0">
                                  {formatLessonDuration(lesson.duration || lesson.videoDuration)}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQ Section Wrapper */}
        <section id="faq" className="scroll-mt-[140px] md:scroll-mt-[160px] mt-16">
          {faqs.length > 0 && (
            <>
              <h2 className="font-headline text-2xl font-bold text-foreground">
                FAQ
              </h2>
              <dl className="mt-4 border border-border/30 rounded-lg overflow-hidden transition-all duration-300">
                {faqs.map((f, i) => (
                  <CourseFAQ key={i} q={f.question} a={f.answer} courseId={courseId} isFirst={i === 0} />
                ))}
              </dl>
            </>
          )}
        </section>
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-28 rounded-2xl border border-border bg-card p-6 shadow-editorial">
          <div className="relative h-56 overflow-hidden rounded-lg">
            <Image src={course.thumbnailUrl as string} alt={course.title} width={600} height={300} className="object-cover" />
          </div>
          <div className="mt-6 flex items-baseline justify-between gap-4">
            <span className="text-2xl md:text-3xl font-black text-primary">
              <span className='text-3xl md:text-4xl mr-1'>৳</span>
              {course.isPaid ? `${course.finalPrice}` : "Free"}
            </span>
            {course.enrollmentCount ? (
              <span className="text-sm text-muted-foreground">
                {course.enrollmentCount} learners
              </span>
            ) : null}
          </div>
          <PrimaryOutLineBtn value={isPending ? "Loading..." : "Enroll Now"} handleBtn={() => handleCheckout(course._id)} disabled={isPending} />
          {course.isPaid && <PrimaryActionBtn value={isPending ? "Loading..." : "Add to Cart"} handleBtn={handleAddToCart} disabled={isPending} />}
        </div>
      </aside>

      {/* Light-weight custom modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* Backdrop Click Close */}
          <div className="absolute inset-0" onClick={() => {
            setActiveModal(null);
            setIsFullscreenVideo(false);
          }} />

          {/* Modal Container */}
          {activeModal === "login" && (
            <div className="relative z-10 w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 transform scale-100 transition-transform animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <LuLock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Log in to watch
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Please log in to your account to view this lesson.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Log In
                  </Link>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground font-semibold text-sm hover:bg-muted/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeModal === "enroll" && (
            <div className="relative z-10 w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-2xl p-6 transform scale-100 transition-transform animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <LuLock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Enroll to watch all lessons
                </h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  This is a premium lesson. Please enroll in the course to unlock full access to all learning materials.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      if (course) handleCheckout(course._id);
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Enroll Now
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground font-semibold text-sm hover:bg-muted/30 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeModal === "video" && selectedLesson && (
            <div 
              className={cn(
                "relative z-10 transition-all duration-300 shadow-2xl p-4 sm:p-6 bg-card border border-border/85",
                isFullscreenVideo 
                  ? "fixed inset-0 w-screen h-screen rounded-none p-0 flex flex-col justify-between bg-black/95 border-0" 
                  : "w-full max-w-2xl rounded-2xl animate-in zoom-in-95 duration-200"
              )}
            >
              {/* Header inside video player modal */}
              <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-4 px-4 pt-2">
                <h3 className={cn("text-base font-bold text-foreground truncate max-w-[70%]", isFullscreenVideo && "text-white")}>
                  {selectedLesson.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreenVideo(!isFullscreenVideo)}
                    className={cn(
                      "p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
                      isFullscreenVideo && "hover:bg-white/10 hover:text-white"
                    )}
                    title={isFullscreenVideo ? "Exit Fullscreen" : "Fullscreen View"}
                  >
                    {isFullscreenVideo ? <LuMinimize className="w-5 h-5" /> : <LuMaximize className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      setIsFullscreenVideo(false);
                    }}
                    className={cn(
                      "p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
                      isFullscreenVideo && "hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <LuX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Element */}
              <div className={cn("relative w-full aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center", isFullscreenVideo && "flex-1 rounded-none")}>
                {selectedLesson.youtubeVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedLesson.youtubeVideoId}?autoplay=1`}
                    title={selectedLesson.title || "Lesson Video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center p-6">
                    <p className="text-sm text-muted-foreground italic">
                      Video source URL is missing for this lesson.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
