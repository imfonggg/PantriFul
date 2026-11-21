export const RESULT_LIMITS = [5, 10, 20, 50, 80, 100] as const;
export const DEFAULT_RESULT_LIMIT = 10;
export function paginateResults<T>(rows: T[], size = DEFAULT_RESULT_LIMIT, page = 1) {
  const safeSize = RESULT_LIMITS.includes(size as typeof RESULT_LIMITS[number]) ? size : DEFAULT_RESULT_LIMIT;
  const pages = Math.max(1, Math.ceil(rows.length / safeSize));
  const current = Math.max(1, Math.min(page, pages));
  return { rows: rows.slice((current - 1) * safeSize, current * safeSize), pages, current };
}
