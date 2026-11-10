// The problems inside #4471, one ticket each. Counted the desk's way (causes.ts → groupByCause):
// unique by id, cause by tenant. The desk files a report it read as a one-day move under its
// tenant's cause and footnotes it (desk-notes.json); the one-day row shows that subset, not extra
// reports.

export type Problem = 'parser' | 'hint' | 'one-day';

export const PROBLEMS: readonly { id: Problem; what: string; ticket: string; outcome: string }[] = [
  {
    id: 'parser',
    what: 'The shared parser reads every date month first; day-first tenants get day and month swapped.',
    ticket: 'https://github.com/pbilan13-sketch/mega-s01e03-what-it-shows/issues/1',
    outcome: 'fixed: fix(dates): parse dd/mm for eu locales',
  },
  {
    id: 'hint',
    what: 'booking-v3 prints MM/DD/YYYY under its date field; day-first tenants type month first and the form reads it day first.',
    ticket: 'https://github.com/pbilan13-sketch/mega-s01e03-what-it-shows/issues/2',
    outcome: "won't fix: booking-v3 form retired",
  },
  {
    id: 'one-day',
    what: 'The booking keeps its month but moves by one day (time zone / DST), not a day-month swap. Filed under parser by tenant.',
    ticket: 'https://github.com/pbilan13-sketch/mega-s01e03-what-it-shows/issues/3',
    outcome: 'not in the engineering update; watch for new one-day reports',
  },
];

export const problem = (id: string) => PROBLEMS.find((p) => p.id === id);
