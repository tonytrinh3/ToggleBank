/**
 * Local Feature Flags Configuration
 * 
 * This replaces LaunchDarkly with a local feature flag system.
 * Flags can be toggled via the Feature Flag Sidebar in the app.
 */

export interface FeatureFlags {
    // AI Configuration
    "ai-config--togglebot": {
        enabled: boolean;
        model: string;
    };
    
    // Release Flags
    "release-new-signup-promo": boolean;
    
    // Guarded Release Flags
    "togglebankDBGuardedRelease": boolean;
    "togglebankAPIGuardedRelease": boolean;
    
    // Feature Toggles
    "wealthManagement": boolean;
    "federatedAccounts": boolean;
    "financialDBMigration": boolean;
}

// Default values for all feature flags
export const DEFAULT_FLAGS: FeatureFlags = {
    "ai-config--togglebot": {
        enabled: true,
        model: "anthropic.claude-3-haiku-20240307-v1:0",
    },
    "release-new-signup-promo": false,
    "togglebankDBGuardedRelease": false,
    "togglebankAPIGuardedRelease": false,
    "wealthManagement": false,
    "federatedAccounts": false,
    "financialDBMigration": false,
};

// Flag metadata for the sidebar UI
export const FLAG_METADATA: Record<keyof FeatureFlags, { name: string; description: string; category: string }> = {
    "ai-config--togglebot": {
        name: "AI Chatbot Config",
        description: "Configure the AI model for the chatbot",
        category: "AI Features",
    },
    "release-new-signup-promo": {
        name: "New Signup Promo",
        description: "Show new promotional content on signup page",
        category: "Release",
    },
    "togglebankDBGuardedRelease": {
        name: "DB Guarded Release",
        description: "Enable database guarded release feature",
        category: "Guarded Release",
    },
    "togglebankAPIGuardedRelease": {
        name: "API Guarded Release",
        description: "Enable API guarded release feature",
        category: "Guarded Release",
    },
    "wealthManagement": {
        name: "Wealth Management",
        description: "Show wealth management features on dashboard",
        category: "Features",
    },
    "federatedAccounts": {
        name: "Federated Accounts",
        description: "Show federated account access section",
        category: "Features",
    },
    "financialDBMigration": {
        name: "Financial DB Migration",
        description: "Use new financial database",
        category: "Migration",
    },
};

// Storage key for persisting flags in localStorage
export const FLAGS_STORAGE_KEY = "togglebank-feature-flags";
