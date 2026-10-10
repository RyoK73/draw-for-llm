"use client";
import { useEffect, useState } from "react";

const generateDateTimeOption = (
): Intl.DateTimeFormatOptions => ({
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone,
});

const LocalTime = ({ updatedAt }: { updatedAt: string }) => {
  const dateUpdatedAt = new Date(updatedAt);
  const [dateTimeString, setDateTimeString] = useState<string>(() => {
    return new Intl.DateTimeFormat("en-US", generateDateTimeOption()).format(
      dateUpdatedAt,
    );
  });

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const userLocalTime = Intl.DateTimeFormat(
      locale,
      generateDateTimeOption(timeZone),
    ).format(dateUpdatedAt);
    setDateTimeString(userLocalTime);
  }, []);

  return <time>{dateTimeString}</time>;
};

export { LocalTime };
