import { describe, expect, test } from "vitest";

import {
  loadExtractedMessageUids,
  mergeExtractedMessageUids,
  storageKeyForMailbox,
} from "./mailExtractionState.js";

class MemoryStorage {
  private readonly data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe("mail extraction state", () => {
  test("uses a stable normalized mailbox key", () => {
    expect(storageKeyForMailbox(" Orders@Example.COM ")).toBe("order-organizer.extracted-uids.v1:orders@example.com");
  });

  test("persists extracted message ids per mailbox", () => {
    const storage = new MemoryStorage();

    const merged = mergeExtractedMessageUids(storage, "orders@example.com", ["101", "102", "101"]);

    expect([...merged]).toEqual(["101", "102"]);
    expect([...loadExtractedMessageUids(storage, "orders@example.com")]).toEqual(["101", "102"]);
    expect([...loadExtractedMessageUids(storage, "other@example.com")]).toEqual([]);
  });

  test("ignores invalid persisted data", () => {
    const storage = new MemoryStorage();
    storage.setItem(storageKeyForMailbox("orders@example.com"), "{broken");

    expect([...loadExtractedMessageUids(storage, "orders@example.com")]).toEqual([]);
  });
});
