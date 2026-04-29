import type { MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import Layout from "~/components/layout/Layout";
import { useWebsite, useWebsitePages, WEBSITES_QUERY_KEYS } from "~/hooks/useWebsites";
import { usePage } from "~/hooks/usePages";
import { useNodeContext } from "~/contexts/NodeContext";
import StateManager, { StateBadge } from "~/components/ui/StateManager";
import {
  PlusIcon,
  PencilIcon,
  GlobeAltIcon,
  ArrowLeftIcon,
  DocumentIcon,
  EyeIcon,
  TrashIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import ShareLinkButton from "~/components/ui/ShareLinkButton";

export const meta: MetaFunction = () => {
  return [{ title: "Website - CRM Dashboard" }];
};

export default function WebsiteDetail() {
  const { orgId, websiteId = "" } = useParams();
  const { buildListPath } = useNodeContext();
  const { website, loading: websiteLoading } = useWebsite(websiteId);
  const { pages, loading: pagesLoading, createPage } = useWebsitePages(websiteId);

  if (websiteLoading) {
    return (
      <Layout>
        <div className="py-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      </Layout>
    );
  }

  if (!website) {
    return (
      <Layout>
        <div className="py-6 text-center">
          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Website not found</h3>
        </div>
      </Layout>
    );
  }

  const attrs = website.attributes;

  // Theme preview colors
  const palette = attrs.theme?.colorPalette;

  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <Link to={buildListPath('websites')} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-1" /> Back to Websites
          </Link>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="h-6 w-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{attrs.name}</h1>
                <StateManager
                  entityType="websites"
                  entityId={websiteId}
                  stateAttrs={attrs}
                  invalidateKeys={[WEBSITES_QUERY_KEYS.all, WEBSITES_QUERY_KEYS.detail(websiteId)]}
                  layout="inline"
                />
              </div>
              <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                <span>/{attrs.slug}</span>
                {attrs.domain && <span>{attrs.domain}</span>}
              </div>
            </div>
            <div className="flex space-x-3">
              {attrs.state?.name === 'published' && (
                <ShareLinkButton
                  url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${attrs.slug}`}
                  title="Share Website"
                  iconOnly={false}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-gray-50"
                />
              )}
              <Link
                to={`/organizations/${orgId}/websites/${websiteId}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" /> Settings & Theme
              </Link>
              <Link
                to={`/organizations/${orgId}/websites/${websiteId}/pages/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                <PlusIcon className="-ml-1 mr-2 h-4 w-4" /> Add Page
              </Link>
            </div>
          </div>

          {/* Theme preview */}
          {palette && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <div className="flex space-x-1">
                  {Object.values(palette).filter(Boolean).map((color, i) => (
                    <div key={i} className="h-5 w-5 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: color as string }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pages */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pages</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">{pages.length} page{pages.length !== 1 ? 's' : ''}</span>
            </div>

            {pagesLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
              </div>
            ) : pages.length === 0 ? (
              <div className="p-8 text-center">
                <DocumentIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No pages yet. Add a page to start building your website.</p>
                <Link
                  to={`/organizations/${orgId}/websites/${websiteId}/pages/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-4 w-4" /> Add Page
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pages.map((page) => (
                  <div key={page.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      {page.attributes.is_homepage && (
                        <HomeIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      )}
                      <div>
                        <Link
                          to={`/organizations/${orgId}/pages/${page.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-purple-600"
                        >
                          {page.attributes.name}
                        </Link>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          /{page.attributes.slug}
                          {page.attributes.is_homepage && <span className="ml-2 text-purple-600">Homepage</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StateBadge state={page.attributes.state} />
                      <div className="flex space-x-2">
                        <Link to={`/organizations/${orgId}/pages/${page.id}`} className="text-purple-600 hover:text-purple-700">
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link to={`/organizations/${orgId}/pages/${page.id}/edit`} className="text-gray-600 hover:text-gray-700 dark:text-gray-400">
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        {page.attributes.state?.name === 'published' && attrs.state?.name === 'published' && (
                          <ShareLinkButton
                            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/${attrs.slug}/${page.attributes.slug}`}
                            title="Share Page"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
