export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-clinic-200 bg-clinic-50/50 px-6 py-12 text-center">
      <h3 className="text-section-title">{title}</h3>
      {description && <p className="text-body mt-2 max-w-md text-clinic-subtle">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
