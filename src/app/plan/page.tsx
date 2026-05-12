/**
 * /plan route — thin server-component wrapper around the planner UI.
 * Auth is enforced upstream by middleware (anonymous users are sent
 * to /login before this page ever renders).
 */
import { PlanWorkspace } from "@/components/plan/PlanWorkspace";

export default function PlanPage() {
  return <PlanWorkspace />;
}
