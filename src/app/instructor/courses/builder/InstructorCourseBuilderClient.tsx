'use client';

import UnifiedCourseBuilder from '@/app/components/CourseBuilder';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';

export default function InstructorCourseBuilderPage() {
  return (
    <InstructorPageWrapper>
      <UnifiedCourseBuilder role="instructor" />
    </InstructorPageWrapper>
  );
}
