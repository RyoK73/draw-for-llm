"use client";
import { useSyncExternalStore } from "react";

const generateDateTimeOption = (
  timeZone: string = "UTC",
): Intl.DateTimeFormatOptions => ({
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone,
});

const subscribe = () => () => {};

const LocalTime = ({ updatedAt }: { updatedAt: string }) => {
  const dateUpdatedAt = new Date(updatedAt);

  const dateTime = useSyncExternalStore(
    subscribe,
    () => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      return Intl.DateTimeFormat(
        locale,
        generateDateTimeOption(timeZone),
      ).format(dateUpdatedAt);
    },
    () => {
      return new Intl.DateTimeFormat("en-US", generateDateTimeOption()).format(
        dateUpdatedAt,
      );
    },
  );

  return <time dateTime={updatedAt}>{dateTime}</time>;
};

export { LocalTime };
