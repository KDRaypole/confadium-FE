import { useState } from 'react';
import { Link, useParams } from '@remix-run/react';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, XMarkIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useOrgNodes, type OrgNode } from '~/hooks/useOrgNodes';

interface NodeListContentProps {
  parentId: string | null;
  levelName: string;
  levelPlural: string;
  nodes: OrgNode[];
  contextLabel?: string;
}

export default function NodeListContent({
  parentId,
  levelName,
  levelPlural,
  nodes,
  contextLabel,
}: NodeListContentProps) {
  const { orgId } = useParams();
  const { createNode, updateNode, deleteNode } = useOrgNodes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<OrgNode | null>(null);
  const [formName, setFormName] = useState('');
  const [formDirected, setFormDirected] = useState(false);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setFormName('');
    setFormDirected(false);
    setEditingNode(null);
    setIsModalOpen(true);
  };

  const openEdit = (node: OrgNode) => {
    setFormName(node.attributes.name);
    setFormDirected(node.attributes.directed ?? false);
    setEditingNode(node);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNode(null);
    setFormName('');
    setFormDirected(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    try {
      if (editingNode) {
        await updateNode({ id: editingNode.id, attrs: { name: formName.trim(), directed: formDirected } });
      } else {
        await createNode({ name: formName.trim(), parent_id: parentId, directed: formDirected });
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save node:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (node: OrgNode) => {
    if (!confirm(`Delete "${node.attributes.name}"? This will also delete all child nodes.`)) return;
    try {
      await deleteNode(node.id);
    } catch (err) {
      console.error('Failed to delete node:', err);
    }
  };

  return (
    <div className="py-6">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {contextLabel && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{contextLabel}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{levelPlural}</h1>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            New {levelName}
          </button>
        </div>

        {/* Grid */}
        {nodes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No {levelPlural.toLowerCase()}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first {levelName.toLowerCase()}.
            </p>
            <button
              onClick={openCreate}
              className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create {levelName}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map(node => (
              <div
                key={node.id}
                className="group relative flex items-center p-4 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
              >
                <Link
                  to={`/organizations/${orgId}/nodes/${node.id}`}
                  className="flex items-center flex-1 min-w-0"
                >
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                    <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {node.attributes.name}
                      </h3>
                      {node.attributes.directed && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" title="Inherits data from parent">
                          <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                          Directed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{levelName}</p>
                  </div>
                </Link>
                {/* Actions */}
                <div className="hidden group-hover:flex items-center space-x-1 ml-2">
                  <button
                    onClick={(e) => { e.preventDefault(); openEdit(node); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(node); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="flex items-center justify-center min-h-full p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {editingNode ? `Edit ${levelName}` : `New ${levelName}`}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={`${levelName} name`}
                    autoFocus
                  />
                </div>

                {/* Directed toggle */}
                <div className="flex items-start space-x-3">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="directed"
                      type="checkbox"
                      checked={formDirected}
                      onChange={(e) => setFormDirected(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="directed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Directed
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Inherit contacts, deals, forms, and other data from above in the hierarchy. When enabled, this {levelName.toLowerCase()} will see all data from its parent nodes and the organization level.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formName.trim()}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingNode ? 'Save Changes' : `Create ${levelName}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
