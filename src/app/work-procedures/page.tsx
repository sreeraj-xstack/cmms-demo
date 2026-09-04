'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { WorkProceduresList } from '@/components/modules/work-procedures/WorkProceduresList';

export default function WorkProceduresPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <WorkProceduresList />
      </main>
    </div>
  );
}
