'use client';

import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import PlatformQuestionBankWorkspace from '@/components/platform-question-bank/PlatformQuestionBankWorkspace';
import { QuestionBankPageLayout } from '@/components/question-bank/QuestionBankPageLayout';

export default function AdminPlatformQuestionBankPage() {
  return (
    <AdminPageWrapper>
      <AdminRoleShell scroll={false}>
        <QuestionBankPageLayout>
          <PlatformQuestionBankWorkspace
            role="admin"
            title="Platform Question Bank"
            description="Subject/topic questions for batches, Test Yourself, and resources — separate from course QB"
          />
        </QuestionBankPageLayout>
      </AdminRoleShell>
    </AdminPageWrapper>
  );
}
