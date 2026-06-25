export default function ClinicPolicyBanner({ clinicInfo }) {
  if (!clinicInfo) return null;

  const pencilHours = clinicInfo.pencil_booking_hours || 4;
  const cancelHours = clinicInfo.cancellation_window_hours || 24;
  const noShowFee = clinicInfo.no_show_fee || '300';

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <strong className="text-slate-800">Clinic policy:</strong>{' '}
      {clinicInfo.schedule} · Lunch {clinicInfo.lunch_break} · Pencil booking {pencilHours}hrs ·
      Cancelling within {cancelHours}hrs may incur ₱{noShowFee} fee.
    </div>
  );
}
