import BankUserDashboard from "@/components/ui/bankcomponents/bankUserDashboard";
import Chatbot from "@/components/chatbot/ChatBot";
import { withAuthGuard } from "@/components/ui/with-auth-guard";

function Dashboard() {
    return (
        <main className={` w-full min-h-screen  bg-cover bg-center bg-no-repeat pb-10`}>
            <BankUserDashboard />
            <Chatbot />
        </main>
    );
}

// Wrap Dashboard with auth guard HOC
// This handles:
// - Showing ForbiddenPage if user lands on /dashboard without authentication
// - Showing loading message and redirecting if user logs out while on dashboard
export default withAuthGuard(Dashboard);
