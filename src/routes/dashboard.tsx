import { ProtectedRoute } from '~/components/auth/protected-route';
import DashboardLayout from '~/components/layout/dashboard-layout';
import AssistantChat from '~/components/chat/assistant-chat';

export const Route = createFileRoute({
  component: DashboardPage
});

function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AssistantChat />
      </DashboardLayout>
    </ProtectedRoute>
  );
}