'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkProceduresList } from '@/components/modules/work-procedures/WorkProceduresList';

export default function WorkProceduresPage() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <WorkProceduresList />
      </div>
    </AppLayout>
  );
}
