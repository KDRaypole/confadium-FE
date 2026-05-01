import type { MetaFunction } from "@remix-run/node";
import { Outlet, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { useNodeContext } from "~/contexts/NodeContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Node - Confadium" },
  ];
};

/**
 * Layout route for node-scoped views.
 * Renders the Layout with the node context active (nodeId from URL params),
 * then renders child routes via Outlet.
 *
 * Routes like /organizations/:orgId/nodes/:nodeId/contacts will match here
 * and the contacts route renders inside the Outlet.
 */
export default function NodeLayout() {
  return <Outlet />;
}
