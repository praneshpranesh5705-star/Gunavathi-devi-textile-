import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Only ever redirect to a path inside this site — never to an absolute URL
  // supplied in the query string, which would be an open-redirect hole.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin";

  return <LoginForm nextPath={safeNext} />;
}
