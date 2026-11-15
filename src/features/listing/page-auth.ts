import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AuthError } from "@/features/auth/errors";

export async function requireListingPageUser() {
  try {
    return await requireUser();
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }
}
