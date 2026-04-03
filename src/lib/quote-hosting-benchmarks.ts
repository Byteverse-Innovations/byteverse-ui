/**
 * Illustrative monthly **starting-point** costs for quote planning — not live pricing.
 * Always verify on the vendor’s site before committing numbers in a contract.
 *
 * Each tier can define `stackLines`: a typical **breakdown** used when you “Generate stack lines”
 * for that provider + tier (compute, DNS, DB, buffers, etc.).
 */
export type HostingStackLineTemplate = {
  label: string
  estMonthlyUsd: number
  notes?: string
  /** Defaults to pass_through in the UI */
  paidBy?: 'client' | 'pass_through' | 'included'
}

export type HostingBenchmarkTier = {
  id: string
  label: string
  description: string
  /** Shown in tier dropdown; stack lines may sum near this for quick sanity. */
  estMonthlyUsd: number
  /** Full suggested line items for this stack (AWS, DO, etc.). */
  stackLines?: HostingStackLineTemplate[]
}

export type HostingBenchmarkProvider = {
  id: 'digitalocean' | 'aws' | 'gcp' | 'heroku'
  label: string
  docUrl: string
  tiers: HostingBenchmarkTier[]
}

export const HOSTING_BENCHMARK_DISCLAIMER =
  'Indicative US-equivalent monthly estimates for planning only. Provider prices, regions, and taxes change — confirm before you quote.'

export const HOSTING_BENCHMARK_PROVIDERS: HostingBenchmarkProvider[] = [
  {
    id: 'digitalocean',
    label: 'DigitalOcean',
    docUrl: 'https://www.digitalocean.com/pricing',
    tiers: [
      {
        id: 'do-droplet-basic-s',
        label: 'Basic Droplet (1 GB)',
        description: 'Single small VPS — dev / very light traffic WordPress.',
        estMonthlyUsd: 6,
        stackLines: [
          { label: 'DigitalOcean — Basic Droplet 1 GB', estMonthlyUsd: 6, notes: 'Compute only; see DO droplet pricing.' },
          {
            label: 'DigitalOcean — Droplet backups (~20%)',
            estMonthlyUsd: 1.2,
            notes: 'Rounded; enable backups in control panel.',
          },
          {
            label: 'DigitalOcean — Bandwidth / overage buffer',
            estMonthlyUsd: 3,
            notes: 'Placeholder for traffic spikes; most small sites stay within pool.',
          },
          {
            label: 'DigitalOcean — Spaces or CDN (optional)',
            estMonthlyUsd: 0,
            notes: 'Add ~$5/mo if offloading media to Spaces + CDN.',
          },
        ],
      },
      {
        id: 'do-droplet-basic-m',
        label: 'Basic Droplet (2 GB)',
        description: 'Typical small production site + modest traffic.',
        estMonthlyUsd: 18,
        stackLines: [
          { label: 'DigitalOcean — Basic Droplet 2 GB', estMonthlyUsd: 18, notes: 'Primary app server.' },
          { label: 'DigitalOcean — Droplet backups (~20%)', estMonthlyUsd: 3.6, notes: 'Rounded snapshot pricing.' },
          {
            label: 'DigitalOcean — Managed DB (optional)',
            estMonthlyUsd: 0,
            notes: 'If using DO Managed MySQL/Postgres, add ~$15+/mo from pricing page.',
          },
          { label: 'DigitalOcean — Load balancer (optional)', estMonthlyUsd: 0, notes: 'Multi-instance setups ~$12/mo LB.' },
          { label: 'DigitalOcean — Egress / CDN buffer', estMonthlyUsd: 5, notes: 'Heavy media or global traffic.' },
        ],
      },
      {
        id: 'do-app-basic',
        label: 'App Platform (Basic)',
        description: 'Managed container / static — check build minutes & bandwidth.',
        estMonthlyUsd: 5,
        stackLines: [
          { label: 'DigitalOcean — App Platform component (Basic)', estMonthlyUsd: 5, notes: 'Check component count & size.' },
          {
            label: 'DigitalOcean — Build minutes overage buffer',
            estMonthlyUsd: 2,
            notes: 'If CI builds exceed included minutes.',
          },
          { label: 'DigitalOcean — Bandwidth buffer', estMonthlyUsd: 2, notes: 'Outbundled transfer beyond allowance.' },
        ],
      },
    ],
  },
  {
    id: 'aws',
    label: 'AWS',
    docUrl: 'https://aws.amazon.com/pricing/',
    tiers: [
      {
        id: 'aws-lightsail-512',
        label: 'Lightsail instance (~512 MB)',
        description: 'Entry bundle; good for tiny stacks / staging.',
        estMonthlyUsd: 5,
        stackLines: [
          { label: 'AWS — Lightsail bundle (512 MB)', estMonthlyUsd: 5, notes: 'Fixed bundle pricing by region.' },
          { label: 'AWS — Lightsail snapshots (typical)', estMonthlyUsd: 1, notes: 'Depends on snapshot GB stored.' },
          {
            label: 'AWS — Route 53 (1 hosted zone)',
            estMonthlyUsd: 0.5,
            notes: 'Per zone + query charges if high DNS volume.',
          },
          { label: 'AWS — Data transfer / NAT buffer', estMonthlyUsd: 3, notes: 'Small buffer; scale with traffic.' },
        ],
      },
      {
        id: 'aws-lightsail-2gb',
        label: 'Lightsail instance (~2 GB)',
        description: 'Common small production footprint (bundle pricing).',
        estMonthlyUsd: 12,
        stackLines: [
          { label: 'AWS — Lightsail bundle (2 GB)', estMonthlyUsd: 12, notes: 'Often includes SSD + transfer allotment.' },
          { label: 'AWS — Lightsail attached block storage', estMonthlyUsd: 3, notes: 'e.g. +32 GB disk; adjust to actual.' },
          { label: 'AWS — Route 53 (1 hosted zone)', estMonthlyUsd: 0.5, notes: 'DNS for apex + www.' },
          {
            label: 'AWS — S3 + CloudFront (static / backups)',
            estMonthlyUsd: 6,
            notes: 'Highly variable — model assets + log/backup storage.',
          },
          {
            label: 'AWS — SES / SNS (email notifications)',
            estMonthlyUsd: 1,
            notes: 'Form mail / alerts; often pennies at low volume.',
          },
          { label: 'AWS — Egress & misc buffer', estMonthlyUsd: 5, notes: 'Unpriced surprises; tune after first month.' },
        ],
      },
      {
        id: 'aws-lightsail-4gb',
        label: 'Lightsail instance (~4 GB)',
        description: 'Heavier WP / small multi-tenant — add RDS/S3 costs separately.',
        estMonthlyUsd: 24,
        stackLines: [
          { label: 'AWS — Lightsail bundle (4 GB)', estMonthlyUsd: 24, notes: 'Primary compute bundle.' },
          { label: 'AWS — Lightsail block storage add-on', estMonthlyUsd: 8, notes: 'Extra disks for DB or media.' },
          { label: 'AWS — Route 53', estMonthlyUsd: 0.5, notes: 'Hosted zones + queries.' },
          {
            label: 'AWS — RDS or Aurora (if not on-instance DB)',
            estMonthlyUsd: 0,
            notes: 'If using RDS, add dedicated line from RDS pricing (often $15–80+).',
          },
          { label: 'AWS — S3 + CloudFront', estMonthlyUsd: 12, notes: 'Scale with traffic and cache hit ratio.' },
          { label: 'AWS — CloudWatch / logs buffer', estMonthlyUsd: 3, notes: 'Log volume can grow quickly — set retention.' },
          { label: 'AWS — WAF / Shield (optional)', estMonthlyUsd: 0, notes: 'Security add-ons priced separately.' },
        ],
      },
    ],
  },
  {
    id: 'gcp',
    label: 'Google Cloud',
    docUrl: 'https://cloud.google.com/pricing',
    tiers: [
      {
        id: 'gcp-e2-micro',
        label: 'Compute Engine e2-micro',
        description: 'Always Free tier eligible in qualifying regions only — verify limits.',
        estMonthlyUsd: 0,
        stackLines: [
          {
            label: 'GCP — Compute Engine e2-micro',
            estMonthlyUsd: 0,
            notes: 'May be $0 only in qualifying Always Free regions/limits — verify account type.',
          },
          { label: 'GCP — Balanced persistent disk (boot)', estMonthlyUsd: 1.2, notes: '~10 GB standard disk illustrative.' },
          { label: 'GCP — Cloud Logging / monitoring buffer', estMonthlyUsd: 2, notes: 'Ingestion & retention costs.' },
          { label: 'GCP — Egress buffer', estMonthlyUsd: 3, notes: 'Outbound traffic beyond free tiers.' },
        ],
      },
      {
        id: 'gcp-e2-small',
        label: 'Compute Engine e2-small',
        description: 'Light production VM before managed services.',
        estMonthlyUsd: 16,
        stackLines: [
          { label: 'GCP — Compute Engine e2-small', estMonthlyUsd: 16, notes: '24/7 VM; price varies by region.' },
          { label: 'GCP — Persistent disk (data volume)', estMonthlyUsd: 2, notes: 'Add disks per GB pricing.' },
          { label: 'GCP — Cloud DNS', estMonthlyUsd: 0.2, notes: 'Per zone + queries.' },
          { label: 'GCP — Cloud NAT / egress buffer', estMonthlyUsd: 6, notes: 'If private nodes need outbound internet.' },
          {
            label: 'GCP — Cloud SQL (optional)',
            estMonthlyUsd: 0,
            notes: 'If using managed DB, add line from Cloud SQL pricing.',
          },
        ],
      },
      {
        id: 'gcp-cloud-run-low',
        label: 'Cloud Run (low steady traffic)',
        description: 'Highly variable — model assumes light always-on + requests.',
        estMonthlyUsd: 20,
        stackLines: [
          { label: 'GCP — Cloud Run (CPU/memory + requests)', estMonthlyUsd: 12, notes: 'Strongly usage-based — revise after load test.' },
          { label: 'GCP — Artifact Registry', estMonthlyUsd: 1, notes: 'Container image storage.' },
          {
            label: 'GCP — HTTPS load balancer (if fronting Run)',
            estMonthlyUsd: 7,
            notes: 'Omit if using default domain only.',
          },
          { label: 'GCP — Logging & error reporting', estMonthlyUsd: 2, notes: 'Volume-dependent.' },
        ],
      },
    ],
  },
  {
    id: 'heroku',
    label: 'Heroku',
    docUrl: 'https://www.heroku.com/pricing',
    tiers: [
      {
        id: 'heroku-eco',
        label: 'Eco dynos',
        description: 'Sleeps when idle — not for 24/7 latency-sensitive sites.',
        estMonthlyUsd: 5,
        stackLines: [
          { label: 'Heroku — Eco dynos', estMonthlyUsd: 5, notes: 'Pool sleeps; not for production SLAs.' },
          {
            label: 'Heroku — Postgres Mini (optional)',
            estMonthlyUsd: 0,
            notes: 'Add Mini ~$5/mo if app needs Heroku Postgres.',
          },
          { label: 'Heroku — Add-on buffer (logging/metrics)', estMonthlyUsd: 2, notes: 'Papertrail/Logplex extras if used.' },
        ],
      },
      {
        id: 'heroku-basic',
        label: 'Basic dyno',
        description: 'Single dyno always-on baseline.',
        estMonthlyUsd: 7,
        stackLines: [
          { label: 'Heroku — Basic dyno', estMonthlyUsd: 7, notes: 'Single always-on web/worker.' },
          { label: 'Heroku — Postgres Mini', estMonthlyUsd: 5, notes: 'Typical small DB tier.' },
          { label: 'Heroku — Redis Mini (optional)', estMonthlyUsd: 3, notes: 'Only if queue/cache needed.' },
        ],
      },
      {
        id: 'heroku-standard-1x',
        label: 'Standard-1X dyno',
        description: 'Typical small app tier; add Postgres / Redis plans separately.',
        estMonthlyUsd: 25,
        stackLines: [
          { label: 'Heroku — Standard-1X dyno', estMonthlyUsd: 25, notes: 'Production-grade dyno; scale horizontally = multiply.' },
          { label: 'Heroku — Postgres Basic or higher', estMonthlyUsd: 9, notes: 'Mini→Basic illustrative; check row limits.' },
          { label: 'Heroku — Redis (optional)', estMonthlyUsd: 3, notes: 'Mini tier if sessions/queue.' },
          { label: 'Heroku — SSL / custom domains', estMonthlyUsd: 0, notes: 'ACM included; Enterprise features extra.' },
        ],
      },
    ],
  },
]

/**
 * Line items to append for a provider + tier. Uses `stackLines` when defined; otherwise one line from the tier.
 */
export function getBenchmarkStackTemplates(
  providerId: string,
  tierId: string
): HostingStackLineTemplate[] {
  const p = HOSTING_BENCHMARK_PROVIDERS.find((x) => x.id === providerId)
  const t = p?.tiers.find((x) => x.id === tierId)
  if (!p || !t) return []
  if (t.stackLines && t.stackLines.length > 0) return t.stackLines
  return [
    {
      label: `${p.label} — ${t.label}`,
      estMonthlyUsd: t.estMonthlyUsd,
      notes: t.description,
    },
  ]
}

export function stackTemplatesSubtotalUsd(lines: HostingStackLineTemplate[]): number {
  return lines.reduce((s, l) => s + (Number(l.estMonthlyUsd) || 0), 0)
}
