<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { problem } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  // The desk's own view: unique ids, cause by tenant.
  const rows = (reports as Report[]).length;
  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const oneDay = $derived(groups.map((g) => ({ cause: g.cause, n: readAs(g, notes.oneDayMove) })).filter((x) => x.n));
  const num = (url?: string) => (url ? '#' + url.split('/').at(-1) : 'none');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket}
  ({rows} rows in the export, {rows - merged.length} of them repeats) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'cause' : 'causes'} by tenant
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>outcome</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      {@const p = problem(g.cause)}
      <tr>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if p}<a href={p.ticket}>{num(p.ticket)}</a>{:else}none{/if}</td>
        <td class="out">{p?.outcome ?? ''}</td>
      </tr>
    {/each}
    {#each oneDay as o (o.cause)}
      {@const p = problem('one-day')}
      <tr class="sub">
        <td><code>one-day</code></td>
        <td>{o.n}</td>
        <td colspan="2">read as a one-day move; counted above under <code>{o.cause}</code></td>
        <td><a href={p?.ticket}>{num(p?.ticket)}</a></td>
        <td class="out">{p?.outcome}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .out { color: var(--muted); font-size: 0.85em; }
  .sub td { color: var(--muted); font-size: 0.9em; }
</style>
