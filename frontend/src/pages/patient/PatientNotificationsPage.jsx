import PageHeader from '../../components/common/PageHeader';
import QueryState from '../../components/common/QueryState';
import NotificationList from '../../components/notifications/NotificationList';
import { CardListSkeleton } from '../../components/patient/PatientSkeletons';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications';

export default function PatientNotificationsPage() {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const list = notifications.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle="Appointment updates and clinic alerts" />

      <QueryState
        isLoading={notifications.isLoading}
        isError={notifications.isError}
        error={notifications.error}
        isEmpty={list.length === 0}
        emptyTitle="No notifications yet"
        emptyDescription="Alerts about appointments, billing, and waiting list updates will appear here."
        skeleton={<CardListSkeleton count={4} />}
        onRetry={() => notifications.refetch()}
      >
        <NotificationList
          notifications={list}
          onMarkRead={(id) => markRead.mutate(id)}
          onMarkAllRead={() => markAllRead.mutate()}
          marking={markRead.isPending || markAllRead.isPending}
        />
      </QueryState>
    </div>
  );
}
