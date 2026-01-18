import { useContext, useEffect } from "react";
import LoginContext from "@/utils/contexts/login";
import BankHomePage from "@/components/ui/bankcomponents/bankHomePage";
import Chatbot from "@/components/chatbot/ChatBot";
import { useRouter } from "next/router";
import { AuthLoading } from "@/components/ui/auth-loading";

export default function Bank() {
    const { isLoggedIn } = useContext(LoginContext);
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard if logged in
        // Using useEffect because router.push() is a side effect that should happen after render
        if (isLoggedIn) {
            router.push("/dashboard");
        }
    }, [isLoggedIn, router]);

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
