import { Outlet } from "@remix-run/react";
import { NodeProvider } from "~/contexts/NodeContext";

/**
 * Pathless layout route for all org-scoped pages.
 * Provides NodeContext at the route level so all child route components
 * (and their hooks) can access the active node before Layout renders.
 */
export default function OrgLayout() {
  return (
    <NodeProvider>
      <Outlet />
    </NodeProvider>
  );
}
