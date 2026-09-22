import { NextRequest } from "next/server";
import { updateSession } from "@/supabase/auth/proxy";

// この関数は、内部で`await`を使用する場合、`async`としてマークできます
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};
