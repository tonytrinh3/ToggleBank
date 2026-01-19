import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/utils/utils"

/**
 * Switch Component (using Radix UI)
 * 
 * A toggle switch component built on @radix-ui/react-switch.
 * Used in the Feature Flag Sidebar to toggle feature flags on/off.
 * 
 * WHY RADIX:
 * - Battle-tested accessibility (ARIA, keyboard navigation, focus management)
 * - Consistent with other Radix components in the project
 * - Less code for us to maintain
 * - Handles edge cases we might miss in a custom implementation
 * 
 * USAGE:
 * ```tsx
 * <Switch
 *   checked={isEnabled}
 *   onCheckedChange={(newValue) => setIsEnabled(newValue)}
 * />
 * ```
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Base styles: Creates the pill-shaped track
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors",
      // Focus styles: Purple ring when focused via keyboard
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
      // Disabled styles
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Dynamic background based on checked state (Radix uses data-state attribute)
      "data-[state=checked]:bg-violet-500 data-[state=unchecked]:bg-slate-600",
      className
    )}
    {...props}
    ref={ref}
  >
    {/* 
      The "thumb" - the circular knob that slides left/right
      Radix handles the state management; we just style based on data-state
    */}
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
        "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
