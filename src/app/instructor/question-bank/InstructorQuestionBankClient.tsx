'use client';

import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import CourseQuestionBankWorkspace from '@/components/question-bank/CourseQuestionBankWorkspace';
import { QuestionBankPageLayout } from '@/components/question-bank/QuestionBankPageLayout';

export default function InstructorQuestionBankPage() {
  return (
    <InstructorPageWrapper>
      <InstructorRoleShell scroll={false}>
        <QuestionBankPageLayout>
          <CourseQuestionBankWorkspace
            role="instructor"
            title="Question Bank"
            description="Questions for your courses — browse by course and chapter"
          />
        </QuestionBankPageLayout>
      </InstructorRoleShell>
    </InstructorPageWrapper>
  );
}
