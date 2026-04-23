import type { MetaFunction } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { pagesApi, type Page } from "~/lib/api/pages";
import { PageBuilderProvider, usePageBuilder } from "~/components/page-builder/PageBuilderContext";
import ComponentRenderer from "~/components/page-builder/ComponentRenderer";
import type { PageComponentNode, PageTheme } from "~/lib/api/types";

export const meta: MetaFunction = () => {
  return [
    { title: "Page" },
    { name: "description", content: "Public page" },
  ];
};

export default function PublicPage() {
  const { websiteSlug, pageSlug } = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!websiteSlug || !pageSlug) {
        setError("Invalid page URL");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const pageData = await pagesApi.getPublicPage(websiteSlug, pageSlug);
        setPage(pageData);
      } catch (err) {
        console.error("Error loading public page:", err);
        setError("Page not found");
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [websiteSlug, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">
            {error || "The page you're looking for doesn't exist or isn't published."}
          </p>
        </div>
      </div>
    );
  }

  const pageData = page as any;
  const structure = (pageData.structure || page.attributes?.structure || null) as PageComponentNode | null;
  const theme = (pageData.theme || page.attributes?.theme || {}) as PageTheme;

  return (
    <PageBuilderProvider initialStructure={structure} initialTheme={theme}>
      <PublicPageContent structure={structure} />
    </PageBuilderProvider>
  );
}

function PublicPageContent({ structure }: { structure: PageComponentNode | null }) {
  const { setEditMode } = usePageBuilder();

  useEffect(() => {
    setEditMode(false);
  }, [setEditMode]);

  if (!structure) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">This page has no content.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ComponentRenderer node={structure} />
    </div>
  );
}
