import type { MetaFunction } from "@remix-run/node";
import Layout from "~/components/layout/Layout";
import { useNodeContext } from "~/contexts/NodeContext";
import NodeListContent from "~/components/nodes/NodeListContent";

export const meta: MetaFunction = () => {
  return [{ title: "Child Nodes - CRM Dashboard" }];
};

export default function NodeChildrenPage() {
  return (
    <Layout>
      <NodeChildrenContent />
    </Layout>
  );
}

function NodeChildrenContent() {
  const { activeNode, childLevel, childNodes } = useNodeContext();

  if (!childLevel) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <p className="text-gray-500">No child levels defined for this node.</p>
      </div>
    );
  }

  return (
    <NodeListContent
      parentId={activeNode?.id || null}
      levelName={childLevel.attributes.name}
      levelPlural={childLevel.attributes.plural}
      nodes={childNodes}
      contextLabel={activeNode?.attributes.name}
    />
  );
}
