import type { MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import ProductEditor from "~/components/products/ProductEditor";
import { useProduct } from "~/hooks/useProducts";

export const meta: MetaFunction = () => {
  return [{ title: "Edit Product - CRM Dashboard" }];
};

export default function EditProduct() {
  const { orgId, productId = "" } = useParams();
  const navigate = useNavigate();
  const { product, loading, updateProduct, isUpdating } = useProduct(productId);

  if (loading || !product) {
    return (
      <Layout>
        <div className="py-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Product</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Update product details, pricing, and availability
            </p>
          </div>
          <ProductEditor
            initialData={product.attributes}
            onSave={async (attrs) => {
              await updateProduct(attrs);
              navigate(`/organizations/${orgId}/products/${productId}`);
            }}
            onCancel={() => navigate(`/organizations/${orgId}/products/${productId}`)}
            saving={isUpdating}
          />
        </div>
      </div>
    </Layout>
  );
}
