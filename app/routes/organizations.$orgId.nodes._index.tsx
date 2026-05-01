import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { useNodeContext } from "~/contexts/NodeContext";
import NodeListContent from "~/components/nodes/NodeListContent";

export const meta: MetaFunction = () => {
  return [{ title: "Nodes - Confadium" }];
};

export default function OrgNodesIndex() {
  return (
    <Layout>
      <OrgNodesContent />
    </Layout>
  );
}

function OrgNodesContent() {
  const { orgId } = useParams();
  const { childLevel, childNodes, hasStructure } = useNodeContext();

  if (!hasStructure || !childLevel) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-gray-500">
          No organizational structure defined. Set up levels on the{' '}
          <Link to={`/organizations/${orgId}/structure`} className="text-blue-600 hover:text-blue-800">Structure</Link> page.
        </p>
      </div>
    );
  }

  return (
    <NodeListContent
      parentId={null}
      levelName={childLevel.attributes.name}
      levelPlural={childLevel.attributes.plural}
      nodes={childNodes}
    />
  );
}
