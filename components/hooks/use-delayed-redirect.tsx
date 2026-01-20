import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

/**
 * Custom hook that handles delayed redirects.
 * 
 * WHY A CUSTOM HOOK INSTEAD OF A UTILITY FUNCTION?
 * - Utility functions can't use React hooks (useEffect, useRouter)
 * - This hook encapsulates the setTimeout + cleanup logic
 * - Can be reused across components that need delayed navigation
 * 
 * @param shouldRedirect - Boolean condition that triggers the redirect
 * @param redirectPath - Path to redirect to (default: "/")
 * @param delayMs - (Optional) Delay in milliseconds before redirecting (default: 2000)
 * 
 * @example
 * // Redirect to dashboard when logged in, with default 2 second delay
 * useDelayedRedirect(isLoggedIn, "/dashboard");
 * 
 * @example
 * // Redirect to home immediately when logged out (pass 0 for no delay)
 * useDelayedRedirect(!isLoggedIn, "/", 0);
 * 
 * @example
 * // Redirect with custom 5 second delay
 * useDelayedRedirect(shouldRedirect, "/home", 5000);
 */
export function useDelayedRedirect(
    shouldRedirect: boolean,
    redirectPath: string = "/",
    delayMs: number = 750
) {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Only set up redirect if condition is true
        if (shouldRedirect) {
            // If delay is 0 or less, redirect immediately
            if (delayMs <= 0) {
                router.push(redirectPath);
            } else {
                // Set up delayed redirect
                timeoutRef.current = setTimeout(() => {
                    router.push(redirectPath);
                }, delayMs);
            }
        }

        // Cleanup function:
        // - Clears timeout if component unmounts before redirect happens
        // - Clears timeout if shouldRedirect changes to false
        // This prevents orphaned redirects and memory leaks
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [shouldRedirect, redirectPath, delayMs, router]);
}
