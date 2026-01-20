import { useContext, useEffect, useRef } from "react";
import LoginContext from "@/utils/contexts/login";
import { ForbiddenPage } from "./forbidden-page";
import { AuthLoading } from "./auth-loading";
import { useDelayedRedirect } from "@/components/hooks/use-delayed-redirect";

/**
 * Higher Order Component (HOC) that protects routes requiring authentication.
 * 
 * WHAT IS A HOC?
 * A Higher Order Component is a function that takes a component and returns a new component
 * with additional functionality. It's a pattern for reusing component logic.
 * 
 * Example usage:
 *   export default withAuthGuard(Dashboard);
 *   // This wraps Dashboard with auth protection logic
 * 
 * BEHAVIOR:
 * - If user lands on protected route without being authenticated → shows ForbiddenPage
 * - If user was logged in and then logs out → shows loading message and redirects
 * 
 * WHY DO WE NEED TO DISTINGUISH BETWEEN THESE TWO SCENARIOS?
 * 1. Direct URL access (e.g., typing /dashboard in browser without login):
 *    → User should see ForbiddenPage with option to go login
 *    → No automatic redirect (let user decide when to navigate)
 * 
 * 2. User logs out while on the dashboard:
 *    → User should see "Logging out..." message
 *    → Automatic redirect to homepage after delay
 *    → This provides feedback that logout is processing
 * 
 * @param Component - The component to protect
 * @param redirectPath - Path to redirect to when user logs out (default: "/")
 * @param loadingMessage - Message to show during logout redirect (default: "Logging out...")
 */
export function withAuthGuard<P extends object>(
    Component: React.ComponentType<P>,
    redirectPath: string = "/",
    loadingMessage: string = "Logging out..."
) {
    /**
     * This is the new component that wraps the original.
     * It receives all the same props as the original component.
     */
    return function AuthGuardedComponent(props: P) {
        // Get current login state from context
        const { isLoggedIn } = useContext(LoginContext);

        /**
         * WHY USE useRef INSTEAD OF useState?
         * 
         * useRef persists values across renders WITHOUT causing re-renders when changed.
         * useState would cause a re-render every time we update the value.
         * 
         * We use refs here because:
         * 1. We need to track state across renders (wasLoggedIn, isInitialMount)
         * 2. We DON'T want to trigger re-renders when these values change
         * 3. We only need these values for conditional logic, not for display
         */

        /**
         * wasLoggedInRef: Tracks if the user was EVER logged in during this component's lifecycle.
         * 
         * PURPOSE: Helps distinguish between:
         * - User who was never logged in (should see ForbiddenPage)
         * - User who was logged in but logged out (should see loading + redirect)
         * 
         * Once set to true, it stays true for the component's lifetime.
         */
        const wasLoggedInRef = useRef<boolean>(false);

        /**
         * isInitialMountRef: Tracks if this is the first render of the component.
         * 
         * PURPOSE: Prevents showing the loading/redirect on the very first render.
         * 
         * WHY IS THIS NEEDED?
         * On the first render, isLoggedIn might be false (context still initializing),
         * but we don't want to show loading/redirect yet because the user
         * didn't just "log out" - they're just arriving at the page.
         * 
         * Starts as true, then set to false after first useEffect runs.
         */
        const isInitialMountRef = useRef<boolean>(true);

        /**
         * FIRST useEffect: TRACKING STATE
         * 
         * PURPOSE: Updates our ref values based on current login state.
         * 
         * WHY A SEPARATE useEffect?
         * We need to separate "tracking" from "side effects" (like redirecting).
         * This useEffect only updates ref values - no side effects.
         * 
         * WHEN DOES IT RUN?
         * - On initial mount (when component first renders)
         * - Whenever isLoggedIn changes (login or logout)
         * 
         * WHAT DOES IT DO?
         * 1. If user is logged in, mark wasLoggedInRef = true
         *    (Once true, stays true - we remember they were logged in)
         * 2. Mark isInitialMountRef = false after first run
         *    (We're no longer on the initial mount)
         */
        useEffect(() => {
            // If user is currently logged in, remember that they were logged in
            // This helps us know later if they "logged out" vs "never logged in"
            if (isLoggedIn) {
                wasLoggedInRef.current = true;
            }

            // After first render, mark that initial mount is complete
            // This prevents the redirect logic from running on first render
            if (isInitialMountRef.current) {
                isInitialMountRef.current = false;
            }
        }, [isLoggedIn]);

        /**
         * COMPUTE REDIRECT CONDITION
         * 
         * This condition determines if we should redirect (user is logging out).
         * We compute it during render using ref values from previous effect runs.
         * 
         * Conditions:
         * 1. !isInitialMountRef.current - Not the first render
         * 2. wasLoggedInRef.current - User was previously logged in
         * 3. !isLoggedIn - User is now logged out
         * 
         * WHY COMPUTE DURING RENDER?
         * - Refs hold values from previous effect runs
         * - This condition is used both for rendering AND for the redirect hook
         * - Computing once ensures consistency between what we show and what we do
         */
        const isLoggingOut = !isInitialMountRef.current && wasLoggedInRef.current && !isLoggedIn;

        /**
         * REDIRECT HOOK: Handles the actual redirect when user logs out.
         * 
         * This uses our reusable useDelayedRedirect hook instead of a manual useEffect.
         * 
         * WHY USE THE HOOK?
         * - Reusability: Same redirect logic used in bank.tsx and here
         * - DRY: Don't repeat setTimeout + cleanup logic in multiple places
         * - Encapsulation: Hook handles router, timeout, and cleanup internally
         * - Consistency: Redirect behavior is standardized across the app
         * 
         * WHAT THE HOOK DOES INTERNALLY:
         * 1. Checks if shouldRedirect (isLoggingOut) is true
         * 2. Sets a setTimeout with the specified delay (2000ms)
         * 3. Calls router.push(redirectPath) when timeout fires
         * 4. Cleans up timeout on unmount or if condition changes
         * 
         * Parameters:
         * - isLoggingOut: Boolean condition that triggers the redirect
         * - redirectPath: Where to redirect ("/" by default)
         * - (optional) delayMs: Defaults to 2000ms if not provided
         */
        useDelayedRedirect(isLoggingOut, redirectPath);

        /**
         * RENDER LOGIC - Determines what to display based on current state
         * 
         * The order of these checks matters!
         */

        /**
         * CHECK 1: Is this a logout scenario?
         * 
         * Conditions:
         * - !isInitialMountRef.current: Not the first render
         * - wasLoggedInRef.current: User was logged in at some point
         * - !isLoggedIn: User is now logged out
         * 
         * If all true → User just logged out → Show loading message
         * The useEffect above will handle the redirect after 2 seconds
         */
        if (!isInitialMountRef.current && wasLoggedInRef.current && !isLoggedIn) {
            return <AuthLoading message={loadingMessage} />;
        }

        /**
         * CHECK 2: Is user not logged in (and never was)?
         * 
         * If we reach here, it means:
         * - Either it's the initial mount, OR user was never logged in
         * - User is not logged in
         * 
         * This is the "direct URL access without auth" scenario
         * → Show ForbiddenPage with button to navigate to login
         */
        if (!isLoggedIn) {
            return <ForbiddenPage />;
        }

        /**
         * CHECK 3: User is logged in
         * 
         * If we reach here, isLoggedIn is true
         * → Render the protected component with all its props
         * 
         * The spread operator {...props} passes all props to the wrapped component
         */
        return <Component {...props} />;
    };
}
