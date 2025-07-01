import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Redirect to organizations page
  return redirect("/organizations");
};

export default function Index() {
  return null;
}

