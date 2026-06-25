function Bone({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Bone className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Bone className="h-24" />
        <Bone className="h-24" />
        <Bone className="h-24" />
      </div>
      <Bone className="h-40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Bone className="h-24" />
        <Bone className="h-24" />
        <Bone className="h-24" />
        <Bone className="h-24" />
      </div>
    </div>
  );
}

export function CardListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Bone key={i} className="h-28" />
      ))}
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <Bone className="h-80 rounded-xl" />
      <Bone className="h-24 rounded-xl" />
    </div>
  );
}

export function TableSkeleton() {
  return <Bone className="hidden h-64 rounded-xl md:block" />;
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Bone className="h-48 rounded-xl" />
      <Bone className="h-96 rounded-xl" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Bone className="h-64 rounded-xl" />
      <Bone className="h-56 rounded-xl" />
    </div>
  );
}
