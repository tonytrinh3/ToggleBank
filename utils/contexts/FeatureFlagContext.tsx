import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { FeatureFlags, DEFAULT_FLAGS, FLAGS_STORAGE_KEY } from "../featureFlags";

/**
 * ============================================================================
 * FEATURE FLAG CONTEXT
 * ============================================================================
 * 
 * PURPOSE:
 * This file provides a local feature flag system that can work alongside or
 * replace LaunchDarkly. It allows developers to toggle features on/off via
 * a sidebar UI without needing a LaunchDarkly account or SDK configuration.
 * 
 * HOW IT WORKS:
 * 1. Feature flags are defined in `utils/featureFlags.ts` with default values
 * 2. This context loads flags from localStorage on app start (persistence)
 * 3. The Feature Flag Sidebar (`components/ui/app-sidebar.tsx`) uses this
 *    context to display and toggle flags
 * 4. Components use `useFlags()` hook to read flag values
 * 5. When flags change, they're automatically saved to localStorage
 * 
 * ARCHITECTURE:
 * 
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │                        _app.tsx                                  │
 *   │  ┌─────────────────────────────────────────────────────────┐   │
 *   │  │              FeatureFlagProvider                         │   │
 *   │  │  ┌─────────────────────────────────────────────────┐    │   │
 *   │  │  │  flags state ←→ localStorage                    │    │   │
 *   │  │  │  (persists between sessions)                    │    │   │
 *   │  │  └─────────────────────────────────────────────────┘    │   │
 *   │  │                      │                                   │   │
 *   │  │         ┌────────────┴────────────┐                     │   │
 *   │  │         ▼                         ▼                     │   │
 *   │  │  ┌─────────────┐          ┌─────────────┐              │   │
 *   │  │  │ AppSidebar  │          │ Components  │              │   │
 *   │  │  │ (toggles)   │          │ (read only) │              │   │
 *   │  │  │             │          │             │              │   │
 *   │  │  │ useFeature  │          │ useFlags()  │              │   │
 *   │  │  │ FlagContext │          │             │              │   │
 *   │  │  └─────────────┘          └─────────────┘              │   │
 *   │  └─────────────────────────────────────────────────────────┘   │
 *   └─────────────────────────────────────────────────────────────────┘
 * 
 * KEY FEATURES:
 * - Persistent: Flags survive page refresh (stored in localStorage)
 * - Type-safe: Full TypeScript support with FeatureFlags interface
 * - Drop-in replacement: useFlags() mimics LaunchDarkly's hook
 * - Reset capability: Can reset all flags to defaults
 */

/**
 * The shape of the context value that components can access.
 * 
 * @property flags - Current values of all feature flags
 * @property setFlag - Set a specific flag to a specific value
 * @property toggleFlag - Toggle a boolean flag (true ↔ false)
 * @property resetFlags - Reset all flags to their default values
 */
interface FeatureFlagContextType {
    flags: FeatureFlags;
    setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
    toggleFlag: (key: keyof FeatureFlags) => void;
    resetFlags: () => void;
}

/**
 * Create the context with default values.
 * These defaults are only used if a component tries to use the context
 * outside of a FeatureFlagProvider (which shouldn't happen).
 */
const FeatureFlagContext = createContext<FeatureFlagContextType>({
    flags: DEFAULT_FLAGS,
    setFlag: () => {},
    toggleFlag: () => {},
    resetFlags: () => {},
});

/**
 * ============================================================================
 * FEATURE FLAG PROVIDER
 * ============================================================================
 * 
 * This component wraps your app and provides feature flag functionality
 * to all child components. It should be placed near the top of your
 * component tree in _app.tsx.
 * 
 * LIFECYCLE:
 * 1. On mount: Load flags from localStorage (if any exist)
 * 2. On flag change: Save updated flags to localStorage
 * 3. On unmount: Cleanup (React handles this automatically)
 * 
 * USAGE:
 * ```tsx
 * // In _app.tsx
 * <FeatureFlagProvider>
 *   <App />
 * </FeatureFlagProvider>
 * ```
 */
export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
    // Store the current flag values
    const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
    
    // Track if we've loaded from localStorage to avoid saving defaults on first render
    const [isInitialized, setIsInitialized] = useState(false);

    /**
     * EFFECT: Load flags from localStorage on mount
     * 
     * Why we merge with DEFAULT_FLAGS:
     * - If new flags are added to the app, they need default values
     * - Old localStorage data might not have the new flags
     * - Spread operator ensures: { ...defaults, ...stored } gives us all flags
     */
    useEffect(() => {
        // Only run on client-side (localStorage doesn't exist on server)
        if (typeof window !== "undefined") {
            try {
                const storedFlags = localStorage.getItem(FLAGS_STORAGE_KEY);
                if (storedFlags) {
                    const parsed = JSON.parse(storedFlags);
                    // Merge: defaults first, then stored values override
                    setFlags({ ...DEFAULT_FLAGS, ...parsed });
                }
            } catch (error) {
                console.warn("Failed to load feature flags from localStorage:", error);
            }
            setIsInitialized(true);
        }
    }, []);

    /**
     * EFFECT: Save flags to localStorage whenever they change
     * 
     * Why we check isInitialized:
     * - Prevents saving DEFAULT_FLAGS before we've loaded stored values
     * - Without this check, we might overwrite user's saved preferences
     * 
     * Flow:
     * 1. Component mounts → isInitialized = false
     * 2. Load effect runs → loads stored flags → isInitialized = true
     * 3. Now any flag changes will trigger this save effect
     */
    useEffect(() => {
        if (isInitialized && typeof window !== "undefined") {
            try {
                localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(flags));
            } catch (error) {
                console.warn("Failed to save feature flags to localStorage:", error);
            }
        }
    }, [flags, isInitialized]);

    /**
     * Set a specific flag to a specific value.
     * 
     * Used for complex flags like AI config where you need to set
     * multiple properties:
     * 
     * ```tsx
     * setFlag("ai-config--togglebot", { enabled: true, model: "claude-3" });
     * ```
     */
    const setFlag = useCallback(<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
        setFlags((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    /**
     * Toggle a boolean flag between true and false.
     * 
     * Handles two types of flags:
     * 1. Simple boolean: wealthManagement: true → false
     * 2. Object with enabled property: { enabled: true, ... } → { enabled: false, ... }
     * 
     * This dual handling allows for flags that have additional configuration
     * (like the AI config which has both enabled state and model selection).
     */
    const toggleFlag = useCallback((key: keyof FeatureFlags) => {
        setFlags((prev) => {
            const currentValue = prev[key];
            
            // Case 1: Simple boolean flag
            if (typeof currentValue === "boolean") {
                return {
                    ...prev,
                    [key]: !currentValue,
                };
            }
            
            // Case 2: Object flag with 'enabled' property (like ai-config--togglebot)
            if (typeof currentValue === "object" && currentValue !== null && "enabled" in currentValue) {
                return {
                    ...prev,
                    [key]: {
                        ...currentValue,
                        enabled: !currentValue.enabled,
                    },
                };
            }
            
            // Unknown flag type - don't modify
            return prev;
        });
    }, []);

    /**
     * Reset all flags to their default values.
     * 
     * Useful for:
     * - Starting fresh during testing
     * - Clearing experimental configurations
     * - Recovering from corrupted flag state
     */
    const resetFlags = useCallback(() => {
        setFlags(DEFAULT_FLAGS);
    }, []);

    return (
        <FeatureFlagContext.Provider value={{ flags, setFlag, toggleFlag, resetFlags }}>
            {children}
        </FeatureFlagContext.Provider>
    );
};

/**
 * ============================================================================
 * useFlags HOOK
 * ============================================================================
 * 
 * READ-ONLY access to feature flag values.
 * 
 * This is designed to be a drop-in replacement for LaunchDarkly's useFlags() hook.
 * Components that were using LaunchDarkly can switch to this local system by
 * just changing the import path.
 * 
 * USAGE:
 * ```tsx
 * import { useFlags } from "@/utils/contexts/FeatureFlagContext";
 * 
 * function MyComponent() {
 *   const { wealthManagement, federatedAccounts } = useFlags();
 *   
 *   return (
 *     <>
 *       {wealthManagement && <WealthManagementSection />}
 *       {federatedAccounts && <FederatedAccountsSection />}
 *     </>
 *   );
 * }
 * ```
 * 
 * COMPARISON WITH LAUNCHDARKLY:
 * - LaunchDarkly: const { myFlag } = useFlags();
 * - Local:        const { myFlag } = useFlags();  // Same API!
 */
export const useFlags = (): FeatureFlags => {
    const { flags } = useContext(FeatureFlagContext);
    return flags;
};

/**
 * ============================================================================
 * useFeatureFlagContext HOOK
 * ============================================================================
 * 
 * FULL access to the feature flag context including modification functions.
 * 
 * Use this when you need to:
 * - Toggle flags (like in the sidebar)
 * - Set specific flag values
 * - Reset flags to defaults
 * 
 * USAGE:
 * ```tsx
 * import { useFeatureFlagContext } from "@/utils/contexts/FeatureFlagContext";
 * 
 * function FlagToggle() {
 *   const { flags, toggleFlag, resetFlags } = useFeatureFlagContext();
 *   
 *   return (
 *     <div>
 *       <Switch 
 *         checked={flags.wealthManagement} 
 *         onCheckedChange={() => toggleFlag("wealthManagement")} 
 *       />
 *       <button onClick={resetFlags}>Reset All</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useFeatureFlagContext = (): FeatureFlagContextType => {
    return useContext(FeatureFlagContext);
};

export default FeatureFlagContext;
