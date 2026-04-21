import { useParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { pagesApi } from "~/lib/api/pages";
import { PageBuilderProvider, ComponentRenderer } from "~/components/page-builder";
import type { PageComponentNode } from "~/lib/api/types";

/**
 * Public page renderer - no authentication required.
 * Renders a page by its ID for public viewing.
 */
export default function PublicPage() {
  const { pageId = "" } = useParams();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['public-page', pageId],
    queryFn: () => pagesApi.getPageById(pageId),
    select: (data) => data.data,
    enabled: !!pageId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">The page you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const structure = page.attributes.structure as PageComponentNode | null;
  const theme = page.attributes.theme || {};

  if (!structure) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">This page has no content.</p>
      </div>
    );
  }

  return (
    <PageBuilderProvider initialStructure={structure} initialTheme={theme}>
      <div className="min-h-screen">
        <ComponentRenderer node={structure} />
      </div>
    </PageBuilderProvider>
  );
}
