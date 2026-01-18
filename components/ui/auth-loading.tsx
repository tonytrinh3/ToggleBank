import { SyncLoader } from "react-spinners";

interface AuthLoadingProps {
    message: string;
}

export function AuthLoading({ message }: AuthLoadingProps) {
    return (
        <div className="w-[100vw] h-[100vh] flex items-center justify-center">
            <div className="flex flex-col gap-y-8 items-center px-4">
                <h1 className="text-4xl text-center">{message}</h1>
                <SyncLoader
                    className=""
                    size={30}
                    margin={20}
                    speedMultiplier={0.8}
                    color={"#405BFF"}
                />
            </div>
        </div>
    );
}
