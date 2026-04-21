import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { usePage } from "~/hooks/usePages";
import { ComponentRenderer } from "~/components/page-builder";
import { PageBuilderProvider } from "~/components/page-builder";
import type { PageComponentNode } from "~/lib/api/types";
import {
  PencilIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

export const meta: MetaFunction = () => {
  return [{ title: "Page Preview - CRM Dashboard" }];
};

export default function PagePreview() {
  const { orgId, pageId = "" } = useParams();
  const { page, loading } = usePage(pageId);

  if (loading) {
    return (
      <Layout>
        <div className="py-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <div className="py-6 text-center">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Page not found</h3>
        </div>
      </Layout>
    );
  }

  const attrs = page.attributes;
  const structure = attrs.structure as PageComponentNode | null;

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link to={`/organizations/${orgId}/pages`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-4">
              <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Pages
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{attrs.name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-500">/{attrs.slug}</span>
                  {attrs.state && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      attrs.state.action === 'published' ? 'bg-green-100 text-green-800' :
                      attrs.state.action === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {attrs.state.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-3">
                {attrs.published_url && (
                  <Link
                    to={`/pages/${pageId}`}
                    target="_blank"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" /> View Live
                  </Link>
                )}
                <Link
                  to={`/organizations/${orgId}/pages/${pageId}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" /> Edit in Builder
                </Link>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {structure ? (
              <PageBuilderProvider initialStructure={structure} initialTheme={attrs.theme || {}}>
                <div className="pointer-events-none">
                  <ComponentRenderer node={structure} />
                </div>
              </PageBuilderProvider>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <DocumentIcon className="mx-auto h-16 w-16 mb-4" />
                <p>This page has no content yet. Open the builder to start editing.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
