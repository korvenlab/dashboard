import { z } from "zod";

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const rootSearchSchema = z.object({
  organization_id: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().optional(),
  ),
  period_days: z.coerce.number().min(1).max(366).catch(30),
  chart_days: z.coerce.number().min(1).max(366).catch(14),
});

export type RootSearch = z.infer<typeof rootSearchSchema>;

export function parseRootSearch(search: Record<string, unknown>): RootSearch {
  const parsed = rootSearchSchema.safeParse(search);
  const base: RootSearch = parsed.success
    ? parsed.data
    : { period_days: 30, chart_days: 14, organization_id: undefined };
  const trimmed =
    typeof base.organization_id === "string" ? base.organization_id.trim() : undefined;
  const organization_id =
    trimmed && uuidRe.test(trimmed) ? trimmed : undefined;
  return { ...base, organization_id };
}

export const dashboardPaths = new Set(["/", "/wagoo", "/avendas"]);
