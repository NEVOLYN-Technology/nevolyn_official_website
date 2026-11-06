import { redirect } from "next/navigation";

/**
 * Root redirect — always send users to /dashboard.
 * Middleware will redirect to /login if not authenticated.
 */
export default function HomePage() {
  redirect("/dashboard");
}
