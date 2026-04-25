import { Chapter } from "@/types/chapter";
import { Lesson } from "@/types/lesson";
import { useMemo } from "react";

type Props = {
    chapters: Chapter[];
    lessons: Lesson[];
  };
  
  export default function CourseCurriculum({ chapters, lessons }: Props) {
    if (!chapters?.length) return <p>No curriculum available</p>;

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
  
    return (
      <div className="space-y-6">
        {chapters.map((chapter) => {
          // filter lessons for this chapter
          const chapterLessons = lessonsByChapter.get(chapter._id) ?? [];
          return (
            <div key={chapter._id} className="border p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                {chapter.title}
              </h3>
  
              {/* Lessons */}
              <div className="space-y-2 pl-4">
                { chapterLessons.length > 0 ? ( 
                  chapterLessons.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="text-sm text-gray-600"
                    >
                      • {lesson.title}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-600">
                    No lessons available
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }