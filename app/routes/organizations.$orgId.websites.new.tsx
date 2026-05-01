import type { MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { useWebsites } from "~/hooks/useWebsites";
import { useNodeContext } from "~/contexts/NodeContext";
import { ThemeEditor } from "~/components/page-builder";
import { PageBuilderProvider } from "~/components/page-builder";
import type { PageTheme } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [{ title: "New Website - Confadium" }];
};

const DEFAULT_THEME: PageTheme = {
  colorPalette: { color1: '#7c3aed', color2: '#a78bfa', color3: '#f5f3ff', color4: '#1e1b4b', color5: '#ffffff' },
  fonts: { headings: { fontFamily: "'Inter', sans-serif" }, paragraphs: { fontFamily: "'Inter', sans-serif" } },
  buttons: { primary: { style: 'solid', shape: 'rounded' } },
};

export default function NewWebsite() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { buildListPath } = useNodeContext();
  const { createWebsite } = useWebsites();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [websiteTheme, setWebsiteTheme] = useState<PageTheme>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);

  const generateSlug = (value: string) => {
    setName(value);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await createWebsite({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description || null,
        domain: domain || null,
        theme: websiteTheme,
      });
      navigate(`/organizations/${orgId}/websites/${result.data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Website</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Set up a new website with a global theme that all pages will inherit
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Details */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input type="text" value={name} onChange={(e) => generateSlug(e.target.value)} required className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-1">/</span>
                  <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Domain</label>
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="www.example.com" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
              </div>
            </div>

            {/* Theme */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Global Theme</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This theme will be inherited by all pages in the website</p>
              </div>
              <PageBuilderProvider initialStructure={null} initialTheme={websiteTheme} onChange={(_, t) => setWebsiteTheme(t)}>
                <ThemeEditor />
              </PageBuilderProvider>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => navigate(buildListPath('websites'))} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button type="submit" disabled={saving || !name || !slug} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Website'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
