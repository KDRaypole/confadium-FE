import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ProductVariantAttributes } from "~/lib/api/types";
import type { Resource } from "~/lib/api/client";

type ProductVariant = Resource<ProductVariantAttributes>;

interface VariantEditorProps {
  variants: ProductVariant[];
  onAdd: (attrs: Partial<ProductVariantAttributes>) => Promise<void>;
  onUpdate: (id: string, attrs: Partial<ProductVariantAttributes>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function VariantEditor({ variants, onAdd, onUpdate, onDelete }: VariantEditorProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [available, setAvailable] = useState(true);

  const resetForm = () => {
    setName("");
    setSku("");
    setPriceCents("");
    setAvailable(true);
    setAdding(false);
    setEditingId(null);
  };

  const handleAdd = async () => {
    await onAdd({
      name,
      sku: sku || null,
      price_cents: priceCents ? Math.round(parseFloat(priceCents) * 100) : null,
      available,
    });
    resetForm();
  };

  const startEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setName(variant.attributes.name);
    setSku(variant.attributes.sku || "");
    setPriceCents(variant.attributes.price_cents != null ? String(variant.attributes.price_cents / 100) : "");
    setAvailable(variant.attributes.available);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await onUpdate(editingId, {
      name,
      sku: sku || null,
      price_cents: priceCents ? Math.round(parseFloat(priceCents) * 100) : null,
      available,
    });
    resetForm();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Variants</h3>
        {!adding && !editingId && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Variant
          </button>
        )}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {variants.map((variant) => (
          <div key={variant.id} className="px-6 py-4">
            {editingId === variant.id ? (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Variant name"
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU"
                  className="w-24 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="number"
                  step="0.01"
                  value={priceCents}
                  onChange={(e) => setPriceCents(e.target.value)}
                  placeholder="Price"
                  className="w-24 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button onClick={handleUpdate} className="text-green-600 hover:text-green-700">
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{variant.attributes.name}</span>
                  {variant.attributes.sku && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">SKU: {variant.attributes.sku}</span>
                  )}
                  {variant.attributes.price_cents != null && (
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      ${(variant.attributes.price_cents / 100).toFixed(2)}
                    </span>
                  )}
                  {!variant.attributes.available && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Unavailable</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => startEdit(variant)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(variant.id)} className="text-red-400 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Variant name"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
                className="w-24 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <input
                type="number"
                step="0.01"
                value={priceCents}
                onChange={(e) => setPriceCents(e.target.value)}
                placeholder="Price"
                className="w-24 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button onClick={handleAdd} disabled={!name} className="text-green-600 hover:text-green-700 disabled:opacity-50">
                <CheckIcon className="h-4 w-4" />
              </button>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {variants.length === 0 && !adding && (
          <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No variants yet. Add variants for different sizes, colors, or options.
          </div>
        )}
      </div>
    </div>
  );
}
