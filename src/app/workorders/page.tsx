'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkordersList } from '@/components/modules/workorders/WorkordersList';

export default function WorkordersPage() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <WorkordersList />
      </div>
    </AppLayout>
  );
}
