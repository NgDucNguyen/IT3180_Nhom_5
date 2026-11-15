import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { AuthError } from "@/features/auth/errors";

export async function requireListingPageUser() {
  try {
    const user = await requireUser();
    if (user.role === ROLES.ADMIN) redirect("/admin");
    if (user.role !== ROLES.SELLER) redirect("/seller/upgrade");
    return user;
  } catch (error) {
    if (error instanceof AuthError) redirect("/login");
    throw error;
  }
}
