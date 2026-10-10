import { render, screen } from "@testing-library/react";
import { SketchList } from "@/sketch-list/sketch-list";
import { getSketchData } from "@/supabase/sketch-crud/getSketchData";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";

vi.mock("@/supabase/utils/serverClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/supabase/sketch-crud/getSketchData", () => ({
  getSketchData: vi.fn(),
}));

const renderSketchList = async () => render(await SketchList());

describe("SketchList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(
      {} as Awaited<ReturnType<typeof createSupabaseServerClient>>,
    );
  });

  test("should render the title and description of each sketch in the given order", async () => {
    vi.mocked(getSketchData).mockResolvedValue({
      ok: true,
      value: [
        {
          id: "id-2",
          title: "second",
          description: "newer description",
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-03T00:00:00Z",
        },
        {
          id: "id-1",
          title: "first",
          description: "older description",
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-02T00:00:00Z",
        },
      ],
    });

    await renderSketchList();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("second");
    expect(links[0]).toHaveTextContent("newer description");
    expect(links[1]).toHaveTextContent("first");
    expect(links[1]).toHaveTextContent("older description");
  });

  test("should link each sketch to /sketches/[id]", async () => {
    vi.mocked(getSketchData).mockResolvedValue({
      ok: true,
      value: [
        {
          id: "id-1",
          title: "first",
          description: "description",
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-02T00:00:00Z",
        },
      ],
    });

    await renderSketchList();

    expect(screen.getByRole("link")).toHaveAttribute("href", "/sketches/id-1");
  });

  test("should not render the description line when the description is empty", async () => {
    vi.mocked(getSketchData).mockResolvedValue({
      ok: true,
      value: [
        {
          id: "id-1",
          title: "no description",
          description: null,
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-02T00:00:00Z",
        },
      ],
    });

    await renderSketchList();

    const link = screen.getByRole("link");
    expect(link.querySelectorAll("span")).toHaveLength(1);
  });

  test("should render a message when there are no sketches", async () => {
    vi.mocked(getSketchData).mockResolvedValue({ ok: true, value: [] });

    await renderSketchList();

    expect(screen.getByText("スケッチがまだありません。")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("should render an error message when fetching fails", async () => {
    vi.mocked(getSketchData).mockResolvedValue({
      ok: false,
      error: new Error("test error"),
    });

    await renderSketchList();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "スケッチ一覧の取得に失敗しました。",
    );
  });
});
