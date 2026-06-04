'use client';

import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import PlatformQuestionBankWorkspace from '@/components/platform-question-bank/PlatformQuestionBankWorkspace';
import { QuestionBankPageLayout } from '@/components/question-bank/QuestionBankPageLayout';

export default function InstructorPlatformQuestionBankPage() {
  return (
    <InstructorPageWrapper>
      <InstructorRoleShell scroll={false}>
        <QuestionBankPageLayout>
          <PlatformQuestionBankWorkspace
            role="instructor"
            title="Platform Question Bank"
            description="Your subject/topic questions — separate from course question bank"
          />
        </QuestionBankPageLayout>
      </InstructorRoleShell>
    </InstructorPageWrapper>
  );
}
