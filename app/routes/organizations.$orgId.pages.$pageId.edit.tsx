import type { MetaFunction } from "@remix-run/node";
import { useParams, useNavigate } from "@remix-run/react";
import { useState, useCallback } from "react";
import { usePage } from "~/hooks/usePages";
import { PageBuilder } from "~/components/page-builder";
import type { PageComponentNode, PageTheme } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [{ title: "Edit Page - CRM Dashboard" }];
};

export default function EditPage() {
  const { orgId, pageId = "" } = useParams();
  const navigate = useNavigate();
  const { page, loading, updatePage } = usePage(pageId);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async (structure: PageComponentNode | null, theme: PageTheme) => {
    if (!page) return;
    setSaving(true);
    try {
      await updatePage({
        name: page.attributes.name,
        slug: page.attributes.slug,
        structure: structure as Record<string, unknown>,
        // Save as theme_overrides — the backend merges with the website theme
        theme_overrides: theme,
      });
    } finally {
      setSaving(false);
    }
  }, [updatePage, page]);

  if (loading || !page) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading page builder...</p>
        </div>
      </div>
    );
  }

  const structure = page.attributes.structure as PageComponentNode | null;
  const theme = page.attributes.theme || {};

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate(`/organizations/${orgId}/pages/${pageId}`)}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          &larr; {page.attributes.name}
        </button>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Editing: {page.attributes.name}
        </span>
        <div className="w-24" /> {/* Spacer for centering */}
      </div>

      {/* Full-screen builder */}
      <div className="flex-1">
        <PageBuilder
          initialStructure={structure}
          initialTheme={theme}
          onSave={handleSave}
          saving={saving}
          websiteId={page.attributes.website_id || undefined}
          pageId={pageId}
        />
      </div>
    </div>
  );
}
