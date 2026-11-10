<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, PROBLEMS } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const rows = (reports as Report[]).length;
  const result = $derived(groupByProblem(reports as Report[], ticket, tenantOf));
  const info = (p: string) => PROBLEMS.find((x) => x.id === p);
  const tags = (t: Record<string, number>) =>
    Object.entries(t)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{result.merged.length}</strong> reports merged into #{ticket}
  ({rows} rows in the export, {rows - result.merged.length} of them repeats) ·
  <strong>{result.groups.length}</strong> {result.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tagged at intake as</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each result.groups as g (g.problem)}
      {@const p = info(g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g.taggedAs)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if p}<a href={p.ticket}>#{p.ticket.split('/').at(-1)}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<ul class="what">
  {#each PROBLEMS as p (p.id)}
    <li><code>{p.id}</code>: {p.what}</li>
  {/each}
</ul>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .what { color: var(--muted); font-size: 0.9em; }
</style>
