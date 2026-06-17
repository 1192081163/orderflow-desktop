import { describe, expect, test } from "vitest";

import {
  canMoveToNextMailDay,
  filterMessagesForMailDay,
  formatMailDayTitle,
} from "./mailDateFilter.js";
import type { EmailMessageSummary } from "../shared/types.js";

const now = new Date("2026-06-17T14:00:00+08:00");

describe("mail date filter", () => {
  test("labels today, yesterday, and older days", () => {
    expect(formatMailDayTitle(0, now)).toBe("今日邮件");
    expect(formatMailDayTitle(1, now)).toBe("昨日邮件");
    expect(formatMailDayTitle(2, now)).toBe("06/15 邮件");
  });

  test("filters messages by selected local day", () => {
    const messages = [
      message("today", "2026-06-17T05:49:00.000Z"),
      message("yesterday", "2026-06-16T06:01:00.000Z"),
      message("unknown", undefined),
    ];

    expect(filterMessagesForMailDay(messages, 0, now).map((item) => item.uid)).toEqual(["today"]);
    expect(filterMessagesForMailDay(messages, 1, now).map((item) => item.uid)).toEqual(["yesterday"]);
  });

  test("does not allow navigating newer than today", () => {
    expect(canMoveToNextMailDay(0)).toBe(false);
    expect(canMoveToNextMailDay(1)).toBe(true);
  });
});

function message(uid: string, date: string | undefined): EmailMessageSummary {
  return {
    uid,
    subject: uid,
    from: "orders@example.com",
    date,
    attachmentCount: 1,
    excelAttachmentNames: [`${uid}.xlsx`],
    hasExcelAttachments: true,
  };
}
