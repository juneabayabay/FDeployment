import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ErrorMessage from '../../components/common/ErrorMessage';
import QueryState from '../../components/common/QueryState';
import DentistCard from '../../components/dentists/DentistCard';
import { useDentistDirectory } from '../../hooks/useDentists';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { parseApiError } from '../../utils/formatters';

export default function PatientDentistsPage() {
  const dentists = useDentistDirectory();
  const list = dentists.data?.results ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Our dentists"
        subtitle="Learn about our dental team before you book"
      />

      <QueryState
        isLoading={dentists.isLoading}
        isError={dentists.isError}
        error={dentists.error}
        onRetry={() => dentists.refetch()}
        isEmpty={!dentists.isLoading && list.length === 0}
        emptyTitle="Directory coming soon"
        emptyDescription="Dentist profiles will appear here once the clinic adds them."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((dentist) => (
            <DentistCard key={dentist.id} dentist={dentist} />
          ))}
        </div>
      </QueryState>

      <p className="text-sm">
        <Link to="/patient/book" className="text-sky-600 hover:text-sky-800">
          Ready to book? Go to appointment booking →
        </Link>
      </p>
    </div>
  );
}
