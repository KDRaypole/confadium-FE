import type { MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import ProductEditor from "~/components/products/ProductEditor";
import { useProducts } from "~/hooks/useProducts";
import { useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Product - CRM Dashboard" },
  ];
};

export default function NewProduct() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { createProduct } = useProducts();
  const [saving, setSaving] = useState(false);

  const handleSave = async (attrs: Parameters<typeof createProduct>[0]) => {
    setSaving(true);
    try {
      const result = await createProduct(attrs);
      navigate(`/organizations/${orgId}/products/${result.data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New Product</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create a new product with pricing and availability options
            </p>
          </div>
          <ProductEditor
            onSave={handleSave}
            onCancel={() => navigate(`/organizations/${orgId}/products`)}
            saving={saving}
          />
        </div>
      </div>
    </Layout>
  );
}
