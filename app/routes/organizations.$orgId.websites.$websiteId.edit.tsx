import type { MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { useWebsite } from "~/hooks/useWebsites";
import { ThemeEditor, PageBuilderProvider } from "~/components/page-builder";
import type { PageTheme } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [{ title: "Edit Website - Confadium" }];
};

export default function EditWebsite() {
  const { orgId, websiteId = "" } = useParams();
  const navigate = useNavigate();
  const { website, loading, updateWebsite, isUpdating } = useWebsite(websiteId);
  const [websiteTheme, setWebsiteTheme] = useState<PageTheme | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Sync form state from loaded website data (once)
  if (website && !initialized) {
    setName(website.attributes.name);
    setSlug(website.attributes.slug);
    setDescription(website.attributes.description || "");
    setDomain(website.attributes.domain || "");
    setInitialized(true);
  }

  if (loading || !website) {
    return (
      <Layout>
        <div className="py-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      </Layout>
    );
  }

  const currentTheme = websiteTheme ?? website.attributes.theme ?? {};

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWebsite({
      name,
      slug,
      description: description || null,
      domain: domain || null,
      theme: currentTheme,
    });
    navigate(`/organizations/${orgId}/websites/${websiteId}`);
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Website</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Update settings and the global theme for all pages
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Domain</label>
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="www.example.com" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Global Theme</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Changes here apply to all pages that haven't overridden these values</p>
              </div>
              <PageBuilderProvider initialStructure={null} initialTheme={currentTheme} onChange={(_, t) => setWebsiteTheme(t)}>
                <ThemeEditor />
              </PageBuilderProvider>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => navigate(`/organizations/${orgId}/websites/${websiteId}`)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={isUpdating} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
