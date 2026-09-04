'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { WorkordersList } from '@/components/modules/workorders/WorkordersList';

export default function WorkordersPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <WorkordersList />
      </main>
    </div>
  );
}
