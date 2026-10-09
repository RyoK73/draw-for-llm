import { getAuthState } from "@/supabase/auth/getAuthState";
import { updateSession } from "@/supabase/auth/proxy";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/supabase/auth/getAuthState", () => ({
  getAuthState: vi.fn(),
}));

const LOCAL_APP_ROOT = "http://localhost:3000";

const run = async (path: string) => {
  return await updateSession(new NextRequest(`${LOCAL_APP_ROOT}${path}`));
};

describe("updateSession", () => {
  describe("The user auth status is signedOut", () => {
    it.each(["/sketches", "/sketches/abc"])(
      "should redirect `/` when the signedOut user accesses %s",
      async (pathname) => {
        vi.mocked(getAuthState).mockResolvedValue("signedOut");
        const res = await run(pathname);
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe(`${LOCAL_APP_ROOT}/`);
      },
    );
    it.each(["/", "/signin", "/signup", "/notexist"])(
      "should pass the redirect as it is when the signedOut user accesses %s",
      async (pathname) => {
        vi.mocked(getAuthState).mockResolvedValue("signedOut");
        const res = await run(pathname);
        expect(res.status).toBe(200);
      },
    );
  });
  describe("The user auth status is registered", () => {
    it.each(["/signin", "/signup"])(
      "should redirect `/sketches` when the registered user accesses %s",
      async (pathname) => {
        vi.mocked(getAuthState).mockResolvedValue("registered");
        const res = await run(pathname);
        expect(res.status).toBe(307);
        expect(res.headers.get("location")).toBe(`${LOCAL_APP_ROOT}/sketches`);
      },
    );
    it.each(["/", "/sketches", "/notexist"])(
      "should pass the redirect as it is when the registered user accesses %s",
      async (pathname) => {
        vi.mocked(getAuthState).mockResolvedValue("registered");
        const res = await run(pathname);
        expect(res.status).toBe(200);
      },
    );
  });
  describe("The user auth status is guest", () => {
    it.each(["/", "/signin", "/signup", "/sketches", "/notexist"])(
      "should pass the redirect as it is when the guest user accesses %s",
      async (pathname) => {
        vi.mocked(getAuthState).mockResolvedValue("guest");
        const res = await run(pathname);
        expect(res.status).toBe(200);
      },
    );
  });
});

describe("redirectFollowRegulations", () => {
  it("should return the NextResponse with the current cookies", async () => {
    vi.mocked(getAuthState).mockResolvedValue("registered");
    vi.mocked(createServerClient).mockImplementation((_url, _key, options) => {
      options.cookies.setAll?.(
        [{ name: "sb-token", value: "abc", options: { path: "/" } }],
        {},
      );
      return {} as ReturnType<typeof createServerClient>;
    });

    const res = await run("/sketches");
    expect(res.cookies.get("sb-token")?.value).toEqual("abc");
  });
});
