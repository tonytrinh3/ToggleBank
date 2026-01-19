import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { FeatureFlags, DEFAULT_FLAGS, FLAGS_STORAGE_KEY } from "../featureFlags";

/**
 * Feature Flag Context
 * 
 * This context provides a local feature flag system that replaces LaunchDarkly.
 * Flags are stored in localStorage and can be toggled via the Feature Flag Sidebar.
 */

interface FeatureFlagContextType {
    flags: FeatureFlags;
    setFlag: <K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => void;
    toggleFlag: (key: keyof FeatureFlags) => void;
    resetFlags: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType>({
    flags: DEFAULT_FLAGS,
    setFlag: () => {},
    toggleFlag: () => {},
    resetFlags: () => {},
});

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
    const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load flags from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const storedFlags = localStorage.getItem(FLAGS_STORAGE_KEY);
                if (storedFlags) {
                    const parsed = JSON.parse(storedFlags);
                    // Merge with defaults to ensure new flags are included
                    setFlags({ ...DEFAULT_FLAGS, ...parsed });
                }
            } catch (error) {
                console.warn("Failed to load feature flags from localStorage:", error);
            }
            setIsInitialized(true);
        }
    }, []);

    // Save flags to localStorage whenever they change
    useEffect(() => {
        if (isInitialized && typeof window !== "undefined") {
            try {
                localStorage.setItem(FLAGS_STORAGE_KEY, JSON.stringify(flags));
            } catch (error) {
                console.warn("Failed to save feature flags to localStorage:", error);
            }
        }
    }, [flags, isInitialized]);

    // Set a specific flag value
    const setFlag = useCallback(<K extends keyof FeatureFlags>(key: K, value: FeatureFlags[K]) => {
        setFlags((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    // Toggle a boolean flag
    const toggleFlag = useCallback((key: keyof FeatureFlags) => {
        setFlags((prev) => {
            const currentValue = prev[key];
            // Only toggle if it's a boolean
            if (typeof currentValue === "boolean") {
                return {
                    ...prev,
                    [key]: !currentValue,
                };
            }
            // For object flags like ai-config--togglebot, toggle the enabled property
            if (typeof currentValue === "object" && currentValue !== null && "enabled" in currentValue) {
                return {
                    ...prev,
                    [key]: {
                        ...currentValue,
                        enabled: !currentValue.enabled,
                    },
                };
            }
            return prev;
        });
    }, []);

    // Reset all flags to defaults
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
 * Hook to access feature flags
 * 
 * This is a drop-in replacement for LaunchDarkly's useFlags() hook.
 * Returns an object with all feature flag values.
 */
export const useFlags = (): FeatureFlags => {
    const { flags } = useContext(FeatureFlagContext);
    return flags;
};

/**
 * Hook to access the full feature flag context
 * 
 * Use this when you need to toggle or set flag values.
 */
export const useFeatureFlagContext = (): FeatureFlagContextType => {
    return useContext(FeatureFlagContext);
};

export default FeatureFlagContext;
