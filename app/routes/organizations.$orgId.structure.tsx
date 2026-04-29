import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { useOrgNodeLevels, useOrgNodes, buildTree, type OrgNodeTree } from "~/hooks/useOrgNodes";
import type { OrgNodeLevelAttributes, OrgNodeAttributes } from "~/lib/api/types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [
    { title: "Organization Structure - CRM Dashboard" },
    { name: "description", content: "Define and manage your organization's hierarchical structure" },
  ];
};

export default function StructurePage() {
  const { orgId } = useParams();

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-6">
            <BuildingOffice2Icon className="h-8 w-8 text-gray-400" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Organization Structure</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Define levels and manage your organizational hierarchy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Level Definitions */}
            <div className="lg:col-span-1">
              <LevelDefinitions />
            </div>

            {/* Node Tree */}
            <div className="lg:col-span-2">
              <NodeTree />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ── Level Definitions Panel ────────────────────────────────

function LevelDefinitions() {
  const { levels, loading, createLevel, updateLevel, deleteLevel } = useOrgNodeLevels();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPlural, setNewPlural] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPlural, setEditPlural] = useState('');

  const nextDepth = levels.length > 0
    ? Math.max(...levels.map(l => l.attributes.depth)) + 1
    : 0;

  const handleAdd = async () => {
    if (!newName.trim() || !newPlural.trim()) return;
    try {
      await createLevel({ depth: nextDepth, name: newName.trim(), plural: newPlural.trim() });
      setNewName('');
      setNewPlural('');
      setAdding(false);
    } catch (err) {
      console.error('Failed to create level:', err);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !editPlural.trim()) return;
    try {
      await updateLevel({ id, attrs: { name: editName.trim(), plural: editPlural.trim() } });
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update level:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this level? Existing nodes at this depth will become invalid.')) return;
    try {
      await deleteLevel(id);
    } catch (err) {
      console.error('Failed to delete level:', err);
    }
  };

  const startEditing = (level: (typeof levels)[0]) => {
    setEditingId(level.id);
    setEditName(level.attributes.name);
    setEditPlural(level.attributes.plural);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Level Definitions</h2>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <PlusIcon className="h-3.5 w-3.5 mr-1" />
          Add Level
        </button>
      </div>
      <div className="p-4 space-y-2">
        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {levels.map((level) => (
          <div key={level.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            {editingId === level.id ? (
              <div className="flex-1 flex items-center space-x-2">
                <span className="text-xs text-gray-400 w-6">L{level.attributes.depth}</span>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Singular"
                />
                <input
                  value={editPlural}
                  onChange={(e) => setEditPlural(e.target.value)}
                  className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Plural"
                />
                <button onClick={() => handleUpdate(level.id)} className="p-1 text-green-600 hover:text-green-800">
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400 w-6">L{level.attributes.depth}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{level.attributes.name}</span>
                  <span className="text-xs text-gray-400">({level.attributes.plural})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => startEditing(level)} className="p-1 text-gray-400 hover:text-blue-600">
                    <PencilIcon className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(level.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {levels.length === 0 && !loading && !adding && (
          <p className="text-sm text-gray-400 text-center py-4">
            No levels defined yet. Add levels to start building your organization structure.
          </p>
        )}

        {adding && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 w-6">L{nextDepth}</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Singular (e.g., Region)"
                autoFocus
              />
              <input
                value={newPlural}
                onChange={(e) => setNewPlural(e.target.value)}
                className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Plural (e.g., Regions)"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setAdding(false)} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">Cancel</button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || !newPlural.trim()}
                className="px-2 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Node Tree Panel ────────────────────────────────────────

function NodeTree() {
  const { nodes, loading, createNode, updateNode, deleteNode } = useOrgNodes();
  const { levels } = useOrgNodeLevels();
  const tree = buildTree(nodes);
  const [addingToParent, setAddingToParent] = useState<string | null | undefined>(undefined);
  const [newNodeName, setNewNodeName] = useState('');

  const canAddRoots = levels.some(l => l.attributes.depth === 0);
  const maxDepth = levels.length > 0 ? Math.max(...levels.map(l => l.attributes.depth)) : -1;

  const getLevelName = (depth: number) => {
    return levels.find(l => l.attributes.depth === depth)?.attributes.name || `Level ${depth}`;
  };

  const handleAddNode = async (parentId: string | null, depth: number) => {
    if (!newNodeName.trim()) return;
    try {
      await createNode({ name: newNodeName.trim(), parent_id: parentId });
      setNewNodeName('');
      setAddingToParent(undefined);
    } catch (err) {
      console.error('Failed to create node:', err);
    }
  };

  const handleDeleteNode = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}" and all its children?`)) return;
    try {
      await deleteNode(id);
    } catch (err) {
      console.error('Failed to delete node:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Organization Tree</h2>
        {canAddRoots && (
          <button
            onClick={() => { setAddingToParent(null); setNewNodeName(''); }}
            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <PlusIcon className="h-3.5 w-3.5 mr-1" />
            Add {getLevelName(0)}
          </button>
        )}
      </div>
      <div className="p-4">
        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {!loading && levels.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Define level names first, then add nodes to build your tree.
          </p>
        )}

        {!loading && levels.length > 0 && tree.length === 0 && addingToParent === undefined && (
          <p className="text-sm text-gray-400 text-center py-8">
            No nodes yet. Click "Add {getLevelName(0)}" to get started.
          </p>
        )}

        {/* Add root node form */}
        {addingToParent === null && (
          <div className="mb-3 flex items-center space-x-2">
            <input
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              className="flex-1 text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={`New ${getLevelName(0)} name...`}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAddNode(null, 0)}
            />
            <button onClick={() => handleAddNode(null, 0)} disabled={!newNodeName.trim()} className="p-1.5 text-green-600 hover:text-green-800 disabled:opacity-50">
              <CheckIcon className="h-4 w-4" />
            </button>
            <button onClick={() => setAddingToParent(undefined)} className="p-1.5 text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tree */}
        <div className="space-y-1">
          {tree.map(node => (
            <TreeNodeItem
              key={node.id}
              node={node}
              depth={0}
              maxDepth={maxDepth}
              getLevelName={getLevelName}
              addingToParent={addingToParent}
              setAddingToParent={setAddingToParent}
              newNodeName={newNodeName}
              setNewNodeName={setNewNodeName}
              onAddNode={handleAddNode}
              onDeleteNode={handleDeleteNode}
              onUpdateNode={updateNode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TreeNodeItem({
  node,
  depth,
  maxDepth,
  getLevelName,
  addingToParent,
  setAddingToParent,
  newNodeName,
  setNewNodeName,
  onAddNode,
  onDeleteNode,
  onUpdateNode,
}: {
  node: OrgNodeTree;
  depth: number;
  maxDepth: number;
  getLevelName: (d: number) => string;
  addingToParent: string | null | undefined;
  setAddingToParent: (id: string | null | undefined) => void;
  newNodeName: string;
  setNewNodeName: (n: string) => void;
  onAddNode: (parentId: string | null, depth: number) => void;
  onDeleteNode: (id: string, name: string) => void;
  onUpdateNode: (args: { id: string; attrs: Partial<OrgNodeAttributes> }) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const hasChildren = node.children.length > 0;
  const canAddChildren = node.attributes.depth < maxDepth;

  const startEditing = () => {
    setEditName(node.attributes.name);
    setEditing(true);
  };

  const saveEdit = () => {
    if (editName.trim() && editName.trim() !== node.attributes.name) {
      onUpdateNode({ id: node.id, attrs: { name: editName.trim() } });
    }
    setEditing(false);
  };

  return (
    <div>
      <div
        className="group flex items-center rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {/* Expand toggle */}
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
          </button>
        ) : (
          <span className="w-6" />
        )}

        {/* Name */}
        {editing ? (
          <div className="flex-1 flex items-center space-x-2 py-1">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            />
            <button onClick={saveEdit} className="p-1 text-green-600"><CheckIcon className="h-4 w-4" /></button>
            <button onClick={() => setEditing(false)} className="p-1 text-gray-400"><XMarkIcon className="h-4 w-4" /></button>
          </div>
        ) : (
          <div className="flex-1 flex items-center py-1.5">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.attributes.name}</span>
            <span className="ml-2 text-xs text-gray-400">{node.attributes.level_name}</span>
          </div>
        )}

        {/* Actions (visible on hover) */}
        {!editing && (
          <div className="hidden group-hover:flex items-center space-x-1 pr-2">
            {canAddChildren && (
              <button
                onClick={() => { setAddingToParent(node.id); setNewNodeName(''); setExpanded(true); }}
                className="p-1 text-gray-400 hover:text-blue-600"
                title={`Add ${getLevelName(node.attributes.depth + 1)}`}
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </button>
            )}
            <button onClick={startEditing} className="p-1 text-gray-400 hover:text-blue-600" title="Rename">
              <PencilIcon className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => onDeleteNode(node.id, node.attributes.name)} className="p-1 text-gray-400 hover:text-red-600" title="Delete">
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Add child form */}
      {addingToParent === node.id && (
        <div className="flex items-center space-x-2 py-1" style={{ paddingLeft: `${(depth + 1) * 20 + 24}px` }}>
          <input
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            className="flex-1 text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder={`New ${getLevelName(node.attributes.depth + 1)} name...`}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onAddNode(node.id, node.attributes.depth + 1)}
          />
          <button onClick={() => onAddNode(node.id, node.attributes.depth + 1)} disabled={!newNodeName.trim()} className="p-1 text-green-600 disabled:opacity-50">
            <CheckIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setAddingToParent(undefined)} className="p-1 text-gray-400">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              getLevelName={getLevelName}
              addingToParent={addingToParent}
              setAddingToParent={setAddingToParent}
              newNodeName={newNodeName}
              setNewNodeName={setNewNodeName}
              onAddNode={onAddNode}
              onDeleteNode={onDeleteNode}
              onUpdateNode={onUpdateNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
