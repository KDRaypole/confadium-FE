import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import Layout from "~/components/layout/Layout";

export const meta: MetaFunction = () => {
  return [
    { title: "Reports - CRM Dashboard" },
    { name: "description", content: "View analytics and generate reports" },
  ];
};

export default function Reports() {
  return (
    <Layout>
      <div className="py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </Layout>
  );
}