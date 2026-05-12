/**
 * /utility route — wraps the Utility workspace that bundles the weather,
 * currency and city-time widgets. The widgets handle their own data
 * fetching client-side.
 */
import { UtilityWorkspace } from "@/components/utility/UtilityWorkspace";

export default function UtilityPage() {
  return <UtilityWorkspace />;
}
