// The problems inside #4471, one per bug. Builds on causes.ts: the tenant decides `parser` or `hint`;
// a report the desk read as a one-day move (desk-notes.json) is neither — the date did not flip,
// it slid by a day. That is a third bug with its own fix.
import notes from '#lib/data/desk-notes.json';
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export const PROBLEMS: readonly { id: Problem; what: string; ticket: string }[] = [
  {
    id: 'parser',
    what: 'The shared parser reads every date month first; day-first tenants get day and month swapped.',
    ticket: 'https://github.com/pbilan13-sketch/mega-s01e03-what-it-shows/issues/1',
  },
  {
    id: 'hint',
    what: 'booking-v3 prints MM/DD/YYYY under its date field; day-first tenants type month first and the form reads it day first.',
    ticket: 'https://github.com/pbilan13-sketch/mega-s01e03-what-it-shows/issues/2',
  },
  {
    id: 'one-day',
    what: 'The booking keeps its month but moves by one day (time zone / DST), not a day-month swap.',
    ticket: 'https://github.com/pbilan13-sketch/mega-s01e03-what-it-shows/issues/3',
  },
];

export function problemOf(r: Report, t: Tenant | undefined): Problem | 'unplaced' {
  if (notes.oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  taggedAs: Record<string, number>;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r));
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        taggedAs: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.meta.intakeTag]: (n[r.meta.intakeTag] ?? 0) + 1 }), {}),
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { merged, groups };
}
