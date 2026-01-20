import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Flag, RotateCcw, Settings2 } from "lucide-react";
import { useFeatureFlagContext } from "@/utils/contexts/FeatureFlagContext";
import { FLAG_METADATA, FeatureFlags } from "@/utils/featureFlags";

/**
 * Feature Flag Sidebar
 * 
 * This sidebar provides a UI to toggle feature flags locally.
 * It mimics LaunchDarkly's feature flag toggles for development and testing.
 */
export function AppSidebar() {
	const { flags, toggleFlag, resetFlags, setFlag } = useFeatureFlagContext();

	// Group flags by category
	const flagsByCategory: Record<string, Array<keyof FeatureFlags>> = {};
	(Object.keys(FLAG_METADATA) as Array<keyof FeatureFlags>).forEach((key) => {
		const category = FLAG_METADATA[key].category;
		if (!flagsByCategory[category]) {
			flagsByCategory[category] = [];
		}
		flagsByCategory[category].push(key);
	});

	// Define category order (Release Features first, then others)
	const categoryOrder = ["Release Features", "AI Features", "Guarded Release", "Migration"];
	const sortedCategories = Object.keys(flagsByCategory).sort((a, b) => {
		const aIndex = categoryOrder.indexOf(a);
		const bIndex = categoryOrder.indexOf(b);
		// If not in order list, put at end
		if (aIndex === -1) return 1;
		if (bIndex === -1) return -1;
		return aIndex - bIndex;
	});

	// Get the current value for display
	const getFlagDisplayValue = (key: keyof FeatureFlags): boolean => {
		const value = flags[key];
		if (typeof value === "boolean") {
			return value;
		}
		if (typeof value === "object" && value !== null && "enabled" in value) {
			return value.enabled;
		}
		return false;
	};

	// Get AI model options
	const aiModels = [
		{ value: "anthropic.claude-3-haiku-20240307-v1:0", label: "Claude 3 Haiku" },
		{ value: "anthropic.claude-3-sonnet-20240229-v1:0", label: "Claude 3 Sonnet" },
		{ value: "anthropic.claude-3-opus-20240229-v1:0", label: "Claude 3 Opus" },
		{ value: "amazon.titan-text-express-v1", label: "Amazon Titan" },
	];

	return (
		<Sidebar side={"right"} variant={"sidebar"} collapsible={"offcanvas"}>
			<SidebarContent className="bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col p-4 text-white">
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-3 mb-2">
						<div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2 rounded-lg">
							<Flag className="h-5 w-5 text-white" />
						</div>
						<h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
							Feature Flags
						</h1>
					</div>
					<p className="text-slate-400 text-sm">
						Toggle features locally for development and testing
					</p>
				</div>

				{/* Reset Button */}
				<Button
					onClick={resetFlags}
					variant="outline"
					className="mb-6 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white"
				>
					<RotateCcw className="h-4 w-4 mr-2" />
					Reset All to Defaults
				</Button>

				{/* Flag Categories */}
				<div className="flex flex-col gap-4 overflow-y-auto">
					{sortedCategories.map((category) => (
						<Card key={category} className="bg-slate-800/50 border-slate-700">
							<CardHeader className="pb-3">
								<CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
									<Settings2 className="h-4 w-4 text-violet-400" />
									{category}
								</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-col gap-4">
								{flagsByCategory[category].map((key) => {
									const meta = FLAG_METADATA[key];
									const isEnabled = getFlagDisplayValue(key);
									const isAIConfig = key === "ai-config--togglebot";

									return (
										<div
											key={key}
											className="flex flex-col gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50"
										>
											<div className="flex items-center justify-between">
												<div className="flex-1 min-w-0 mr-3">
													<p className="font-medium text-sm text-white truncate">
														{meta.name}
													</p>
													<p className="text-xs text-slate-400 mt-0.5">
														{meta.description}
													</p>
												</div>
												<Switch
													checked={isEnabled}
													onCheckedChange={() => toggleFlag(key)}
													className="data-[state=checked]:bg-violet-500"
												/>
											</div>

											{/* AI Model Selector (only for ai-config flag) */}
											{isAIConfig && isEnabled && (
												<div className="mt-2 pt-2 border-t border-slate-700">
													<label className="text-xs text-slate-400 mb-1 block">
														AI Model
													</label>
													<select
														value={
															(flags["ai-config--togglebot"] as { enabled: boolean; model: string })
																.model
														}
														onChange={(e) => {
															setFlag("ai-config--togglebot", {
																enabled: true,
																model: e.target.value,
															});
														}}
														className="w-full bg-slate-800 border border-slate-600 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
													>
														{aiModels.map((model) => (
															<option key={model.value} value={model.value}>
																{model.label}
															</option>
														))}
													</select>
												</div>
											)}

											{/* Flag key badge */}
											<div className="mt-1">
												<code className="text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
													{key}
												</code>
											</div>
										</div>
									);
								})}
							</CardContent>
						</Card>
					))}
				</div>

				{/* Footer */}
				<div className="mt-auto pt-4 border-t border-slate-700">
					<p className="text-xs text-slate-500 text-center">
						Flags are stored in localStorage
					</p>
				</div>
			</SidebarContent>
		</Sidebar>
	);
}
