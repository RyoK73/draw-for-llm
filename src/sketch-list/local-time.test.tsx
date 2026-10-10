import { LocalTime } from "@/sketch-list/local-time";
import { render, screen } from "@testing-library/react";
import { dateTimeTestHelper } from "@/sketch-list/testUtility";

const { generateTestDateTime } = dateTimeTestHelper();
const now = new Date();
const dateTimeUTC = new Date(now).toISOString();

it("should return the datetime of the locale timeZone, which is converted from the UTC datetime", () => {
  render(<LocalTime updatedAt={dateTimeUTC} />);
  const time = screen.getByRole("time");
  expect(time.textContent).toBe(generateTestDateTime(now));
});
