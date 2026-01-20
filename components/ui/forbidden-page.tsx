import { useRouter } from "next/router";
import { Button } from "./button";
import { Lock, ArrowLeft } from "lucide-react";

export function ForbiddenPage() {
    const router = useRouter();

    const handleGoToHome = () => {
        router.push("/");
    };

    return (
        <div className="w-[100vw] h-[100vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex flex-col gap-y-8 items-center px-4 max-w-md text-center">
                <div className="flex flex-col items-center gap-y-4">
                    <div className="p-4 bg-red-100 rounded-full">
                        <Lock className="w-16 h-16 text-red-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">Access Forbidden</h1>
                    <p className="text-lg text-gray-600">
                        You haven't logged in yet to see the dashboard. Please log in to continue.
                    </p>
                </div>
                
                <Button
                    onClick={handleGoToHome}
                    className="bg-loginComponentBlue text-white hover:bg-loginComponentBlue/90 px-8 py-6 text-lg font-sohnelight"
                    size="lg"
                >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Go to Homepage to Login
                </Button>
            </div>
        </div>
    );
}
