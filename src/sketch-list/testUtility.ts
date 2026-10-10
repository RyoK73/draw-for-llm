const dateTimeTestHelper = () => {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const dateTimeOption = (timeZone?: string): Intl.DateTimeFormatOptions => ({
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone,
  });
  const generateTestDateTime = (testDateTime: Date) => {
    return Intl.DateTimeFormat(locale, dateTimeOption(timeZone)).format(
      testDateTime,
    );
  };
  return { generateTestDateTime };
};

export { dateTimeTestHelper };
