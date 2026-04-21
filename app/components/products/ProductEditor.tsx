import { useState } from "react";
import {
  CurrencyDollarIcon,
  PhotoIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ProductAttributes, PricingType, PricingTier } from "~/lib/api/types";

interface ProductEditorProps {
  initialData?: Partial<ProductAttributes>;
  onSave: (attrs: Partial<ProductAttributes>) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export default function ProductEditor({ initialData, onSave, onCancel, saving }: ProductEditorProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [sku, setSku] = useState(initialData?.sku || "");
  const [priceCents, setPriceCents] = useState(initialData?.price_cents ? String(initialData.price_cents / 100) : "");
  const [currency, setCurrency] = useState(initialData?.currency || "usd");
  const [pricingType, setPricingType] = useState<PricingType>(initialData?.pricing_type || "fixed");
  const [category, setCategory] = useState(initialData?.category || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [available, setAvailable] = useState(initialData?.available ?? true);
  const [inventoryCount, setInventoryCount] = useState(initialData?.inventory_count != null ? String(initialData.inventory_count) : "");
  const [tiers, setTiers] = useState<PricingTier[]>(initialData?.pricing_config?.tiers || []);
  const [minCents, setMinCents] = useState(initialData?.pricing_config?.min_cents ? String(initialData.pricing_config.min_cents / 100) : "");
  const [maxCents, setMaxCents] = useState(initialData?.pricing_config?.max_cents ? String(initialData.pricing_config.max_cents / 100) : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const attrs: Partial<ProductAttributes> = {
      name,
      description: description || null,
      sku: sku || null,
      price_cents: priceCents ? Math.round(parseFloat(priceCents) * 100) : null,
      currency,
      pricing_type: pricingType,
      category: category || null,
      image_url: imageUrl || null,
      available,
      inventory_count: inventoryCount ? parseInt(inventoryCount, 10) : null,
      pricing_config: {},
    };

    if (pricingType === "tiered") {
      attrs.pricing_config = { tiers };
    } else if (pricingType === "variable") {
      attrs.pricing_config = {
        min_cents: minCents ? Math.round(parseFloat(minCents) * 100) : undefined,
        max_cents: maxCents ? Math.round(parseFloat(maxCents) * 100) : undefined,
      };
    }

    await onSave(attrs);
  };

  const addTier = () => {
    setTiers([...tiers, { min_quantity: tiers.length > 0 ? (tiers[tiers.length - 1].max_quantity || 0) + 1 : 1, max_quantity: null, price_cents: 0 }]);
  };

  const updateTier = (index: number, field: keyof PricingTier, value: number | null) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Product Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="block w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., service, digital, physical"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
            <div className="relative">
              <PhotoIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="block w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pricing</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pricing Type</label>
            <select
              value={pricingType}
              onChange={(e) => setPricingType(e.target.value as PricingType)}
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              <option value="fixed">Fixed Price</option>
              <option value="variable">Variable (Pay What You Want)</option>
              <option value="tiered">Tiered Pricing</option>
            </select>
          </div>

          {pricingType === "fixed" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceCents}
                    onChange={(e) => setPriceCents(e.target.value)}
                    className="block w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                  <option value="gbp">GBP</option>
                  <option value="cad">CAD</option>
                </select>
              </div>
            </div>
          )}

          {pricingType === "variable" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Price</label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={minCents}
                    onChange={(e) => setMinCents(e.target.value)}
                    className="block w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Price</label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={maxCents}
                    onChange={(e) => setMaxCents(e.target.value)}
                    className="block w-full pl-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {pricingType === "tiered" && (
            <div className="space-y-3">
              {tiers.map((tier, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Min Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={tier.min_quantity}
                        onChange={(e) => updateTier(i, "min_quantity", parseInt(e.target.value, 10))}
                        className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Max Qty</label>
                      <input
                        type="number"
                        min="1"
                        value={tier.max_quantity ?? ""}
                        onChange={(e) => updateTier(i, "max_quantity", e.target.value ? parseInt(e.target.value, 10) : null)}
                        placeholder="Unlimited"
                        className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tier.price_cents / 100}
                        onChange={(e) => updateTier(i, "price_cents", Math.round(parseFloat(e.target.value) * 100))}
                        className="block w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeTier(i)} className="text-red-500 hover:text-red-700">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTier}
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                + Add Tier
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Availability</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center">
            <input
              id="available"
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Available for purchase
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inventory Count</label>
            <input
              type="number"
              min="0"
              value={inventoryCount}
              onChange={(e) => setInventoryCount(e.target.value)}
              placeholder="Leave empty for unlimited"
              className="block w-full max-w-xs border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
