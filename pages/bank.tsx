import { useContext } from "react";
import LoginContext from "@/utils/contexts/login";
import BankHomePage from "@/components/ui/bankcomponents/bankHomePage";
import Chatbot from "@/components/chatbot/ChatBot";
import { AuthLoading } from "@/components/ui/auth-loading";
import { useDelayedRedirect } from "@/components/hooks/use-delayed-redirect";

export default function Bank() {
    const { isLoggedIn } = useContext(LoginContext);

    // Redirect to dashboard if logged in
    // Uses default 2000ms delay to show AuthLoading before redirecting
    useDelayedRedirect(isLoggedIn, "/dashboard");

    // Prevent flash of home page content if user is logged in
    // Show loading state while redirecting to avoid rendering home page before redirect
    if (isLoggedIn) {
        return <AuthLoading message="Authenticating..." />;
    }

    return (
        <main className={` w-full min-h-screen  bg-cover bg-center bg-no-repeat pb-10`}>
            <BankHomePage />
            <Chatbot />
        </main>
    );
}
