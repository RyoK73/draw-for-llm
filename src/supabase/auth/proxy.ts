import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAuthState } from "@/supabase/auth/getAuthState";

const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const redirectFollowRegulations = (pathname: string = "/") => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const redirectResponse = NextResponse.redirect(url);

    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));

    return redirectResponse;
  };

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabaseClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.

  const authState = await getAuthState(supabaseClient);

  switch (authState) {
    case "signedOut":
      if (request.nextUrl.pathname.startsWith("/sketches")) {
        return redirectFollowRegulations();
      }
      break;
    case "registered":
      if (
        request.nextUrl.pathname.startsWith("/signin") ||
        request.nextUrl.pathname.startsWith("/signup")
      ) {
        return redirectFollowRegulations("/sketches");
      }
      break;
  }

  return supabaseResponse;
};

export { updateSession };
