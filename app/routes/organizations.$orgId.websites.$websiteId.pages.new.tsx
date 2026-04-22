import type { MetaFunction } from "@remix-run/node";
import { useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/layout/Layout";
import { TemplateSelector } from "~/components/page-builder";
import { useWebsite, useWebsitePages } from "~/hooks/useWebsites";
import type { PageComponentNode, PageTheme } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [{ title: "New Page - CRM Dashboard" }];
};

export default function NewWebsitePage() {
  const { orgId, websiteId = "" } = useParams();
  const navigate = useNavigate();
  const { website } = useWebsite(websiteId);
  const { createPage } = useWebsitePages(websiteId);
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedStructure, setSelectedStructure] = useState<PageComponentNode | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isHomepage, setIsHomepage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleTemplateSelect = (structure: PageComponentNode, _theme: PageTheme, tplName: string) => {
    setSelectedStructure(structure);
    setTemplateName(tplName);
    setStep('details');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await createPage({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: description || null,
        structure: selectedStructure as unknown as Record<string, unknown>,
        theme_overrides: {},
        template_name: templateName,
        is_homepage: isHomepage,
      });
      navigate(`/organizations/${orgId}/pages/${result.data.id}/edit`);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (value: string) => {
    setName(value);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Add Page to {website?.attributes.name || 'Website'}
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {step === 'template' ? 'Choose a template to get started' : 'Enter page details'}
            </p>
            {website?.attributes.theme?.colorPalette && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                This page will inherit the website's global theme. You can override specific values in the page builder.
              </p>
            )}
          </div>

          {step === 'template' ? (
            <TemplateSelector onSelect={handleTemplateSelect} />
          ) : (
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-500">Template:</span>
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{templateName}</span>
                  <button type="button" onClick={() => setStep('template')} className="text-xs text-gray-500 hover:text-gray-700 underline">Change</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Name *</label>
                  <input type="text" value={name} onChange={(e) => generateSlug(e.target.value)} required placeholder="e.g., Home, About Us, Contact" className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Slug *</label>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-1">/{website?.attributes.slug}/</span>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm" />
                </div>

                <div className="flex items-center">
                  <input id="is_homepage" type="checkbox" checked={isHomepage} onChange={(e) => setIsHomepage(e.target.checked)} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                  <label htmlFor="is_homepage" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Set as homepage
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => navigate(`/organizations/${orgId}/websites/${websiteId}`)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !name || !slug} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create & Open Builder'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
