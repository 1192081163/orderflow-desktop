const EXTRACTED_UIDS_STORAGE_PREFIX = "order-organizer.extracted-uids.v1";

export interface MailExtractionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function storageKeyForMailbox(email: string): string {
  return `${EXTRACTED_UIDS_STORAGE_PREFIX}:${normalizeMailbox(email)}`;
}

export function loadExtractedMessageUids(storage: MailExtractionStorage, email: string): Set<string> {
  const raw = storage.getItem(storageKeyForMailbox(email));
  if (!raw) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((uid): uid is string => typeof uid === "string" && uid.trim().length > 0));
  } catch {
    return new Set();
  }
}

export function mergeExtractedMessageUids(storage: MailExtractionStorage, email: string, uids: string[]): Set<string> {
  const next = loadExtractedMessageUids(storage, email);
  uids.map((uid) => uid.trim()).filter(Boolean).forEach((uid) => next.add(uid));
  storage.setItem(storageKeyForMailbox(email), JSON.stringify([...next]));
  return next;
}

function normalizeMailbox(email: string): string {
  return email.trim().toLowerCase();
}
