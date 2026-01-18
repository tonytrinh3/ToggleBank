import { useContext, useEffect } from "react";
import LoginContext from "@/utils/contexts/login";
import BankUserDashboard from "@/components/ui/bankcomponents/bankUserDashboard";
import Chatbot from "@/components/chatbot/ChatBot";
import { useRouter } from "next/router";
import { AuthLoading } from "@/components/ui/auth-loading";

export default function Dashboard() {
    const { isLoggedIn } = useContext(LoginContext);
    const router = useRouter();

    useEffect(() => {
        // Redirect to home if not logged in
        if (!isLoggedIn) {
            router.push("/bank");
        }
    }, [isLoggedIn, router]);

    // Show loading state while redirecting if user is not logged in
    if (!isLoggedIn) {
        return <AuthLoading message="Logging out..." />;
    }

    return (
        <main className={` w-full min-h-screen  bg-cover bg-center bg-no-repeat pb-10`}>
            <BankUserDashboard />
            <Chatbot />
        </main>
    );
}
