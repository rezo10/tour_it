/**
 * /plan route — thin server-component wrapper around the planner UI.
 * Auth is enforced upstream by middleware (anonymous users are sent
 * to /login before this page ever renders).
 */
import { Suspense } from "react";
import { PlanWorkspace } from "@/components/plan/PlanWorkspace";
import { Loader2 } from "lucide-react";

function PlanLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-coral-600" aria-hidden />
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<PlanLoading />}>
      <PlanWorkspace />
    </Suspense>
  );
}
