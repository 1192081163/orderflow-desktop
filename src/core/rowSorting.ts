import type { ExtractedOrderRow } from "../shared/types.js";

const IDEAL_D_DATE_INDEX = 14;
const EXCEL_EPOCH_OFFSET_DAYS = 25569;
const MS_PER_DAY = 86_400_000;

export function sortExtractedRowsByIdealDate(rows: ExtractedOrderRow[]): ExtractedOrderRow[] {
  return rows
    .map((row, index) => ({ row, index, dateMs: idealDateSortValue(row.values[IDEAL_D_DATE_INDEX]) }))
    .sort((left, right) => {
      if (left.dateMs === null && right.dateMs === null) return left.index - right.index;
      if (left.dateMs === null) return 1;
      if (right.dateMs === null) return -1;
      return left.dateMs - right.dateMs || left.index - right.index;
    })
    .map((item) => item.row);
}

function idealDateSortValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return excelSerialDateMs(value);
  if (typeof value !== "string") return null;

  const text = value.trim();
  if (!text) return null;

  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDate) {
    return Date.UTC(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }

  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? null : parsed;
}

function excelSerialDateMs(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  return Math.round((value - EXCEL_EPOCH_OFFSET_DAYS) * MS_PER_DAY);
}
