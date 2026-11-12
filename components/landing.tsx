'use client'

import {
  ArrowUpRight,
  Coins,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { WalletButton } from '@/components/connect-wallet'
import { isFactoryConfigured } from '@/lib/contracts'
import { PREVIEW_VAULTS } from '@/lib/vaults'

const TICKER = [
  { symbol: 'TSLA', weight: 40 },
  { symbol: 'AMZN', weight: 35 },
  { symbol: 'NFLX', weight: 25 },
  { symbol: 'PLTR', weight: 30 },
  { symbol: 'AMD', weight: 20 },
]

export function Landing() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <Constituents />
      <Statement />
      <HowItWorks />
      <Features />
      <Closing />
      <Footer />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_-10%,rgba(191,242,211,0.12),transparent_55%),radial-gradient(ellipse_at_10%_20%,rgba(227,200,154,0.06),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(226,240,232,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,240,232,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
        <div className="animate-fade-up">
          <p className="eyebrow flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-primary" />
            Tokenized equity infrastructure
          </p>

          <h1 className="display mt-6 text-5xl sm:text-6xl lg:text-[4.75rem]">
            Diversified exposure.
            <br />
            <em className="font-normal italic text-accent">One</em> transaction.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            RobinFi packages tokenized equities into ERC-4626 index vaults. Define a basket, set
            the weights, and let anyone take a position in a single deposit.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <WalletButton className="px-6 py-3.5" />

            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border/70 pt-7">
            {[
              { value: '5', label: 'Tokenized names' },
              { value: '1', label: 'Transaction to diversify' },
              { value: '0', label: 'Intermediaries' },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="numeric font-serif text-3xl">{stat.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <VaultTicket />
      </div>
    </section>
  )
}

function VaultTicket() {
  const vault = PREVIEW_VAULTS[0]

  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms]">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_60%_20%,rgba(191,242,211,0.14),transparent_60%)] blur-2xl"
      />
      <div className="panel relative overflow-hidden p-7 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
        <div className="flex items-start justify-between">
          <div>
            <span className="numeric rounded-md border border-border/80 px-2 py-1 text-[11px] tracking-[0.14em] text-muted-foreground">
              {vault.symbol}
            </span>
            <p className="mt-3 font-serif text-2xl">{vault.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {vault.tokens.length} names · weighted
            </p>
          </div>
          <span className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Preview
          </span>
        </div>

        <div className="mt-8">
          <p className="eyebrow">Total value locked</p>
          <p className="numeric mt-2 font-serif text-5xl tracking-tight">
            84.20 <span className="text-2xl text-muted-foreground">ETH</span>
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {vault.tokens.map((token, index) => (
            <div key={token}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{token}</span>
                <span className="numeric text-muted-foreground">
                  {Math.round((vault.weights[index] ?? 0) * 100)}%
                </span>
              </div>
              <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary/80"
                  style={{ width: `${(vault.weights[index] ?? 0) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-5 text-xs text-muted-foreground">
          <span>ERC-4626 shares</span>
          <span className="flex items-center gap-1.5 text-primary">
            Rebalances on-chain <Sparkles className="size-3" />
          </span>
        </div>
      </div>

      <div className="panel-soft absolute -bottom-7 -left-4 hidden w-52 animate-drift p-4 sm:block">
        <p className="eyebrow">Your position</p>
        <p className="numeric mt-1.5 font-serif text-xl">2.4180 ETH</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          2.418 TECH shares
        </p>
      </div>
    </div>
  )
}

function Constituents() {
  return (
    <section className="border-y border-border/70">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-10 gap-y-5 px-4 py-6">
        <p className="eyebrow shrink-0">Sample weights</p>
        <div className="flex flex-1 flex-wrap items-center gap-x-8 gap-y-4">
          {TICKER.map((item) => (
            <div key={item.symbol} className="flex items-center gap-3">
              <span className="numeric text-sm font-medium tracking-wide">{item.symbol}</span>
              <span className="numeric text-xs text-muted-foreground">{item.weight}%</span>
            </div>
          ))}
        </div>
        <a
          href="#strategy"
          className="ml-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          See strategy <ArrowUpRight className="size-3" />
        </a>
      </div>
    </section>
  )
}

function Statement() {
  return (
    <section id="strategy" className="mx-auto max-w-6xl px-4 py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <p className="eyebrow">Why an index</p>
        <div>
          <p className="display text-3xl leading-[1.15] sm:text-4xl">
            Five orders, or one <em className="italic text-accent">position</em>. That is the
            difference.
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            A vault bundles tokenized equities into a single asset. Deposit once, hold
            transferable shares, and keep the weights you chose — no broker, no minimums, and no
            separate ticket every time your conviction changes.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Self-custody by default',
                body: 'Shares live in your wallet. The vault holds assets and never your keys.',
              },
              {
                title: 'Permissionless issuance',
                body: 'Anyone can launch and seed a vault. The market decides what is worth owning.',
              },
            ].map((item) => (
              <div key={item.title} className="panel-soft p-5">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      index: '01',
      title: 'Define the basket',
      body: 'Select up to five tokenized equities and set equal-weight or custom allocations.',
    },
    {
      index: '02',
      title: 'Deploy the vault',
      body: 'A factory contract issues an ERC-4626 vault with transferable shares against ETH deposits.',
    },
    {
      index: '03',
      title: 'Open it to capital',
      body: 'Seed it yourself, or publish it and let anyone deposit into your strategy.',
    },
  ]

  return (
    <section id="how" className="border-t border-border/70 bg-secondary/20">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">From thesis to vault in three steps.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Standard ERC-4626-style accounting keeps shares legible to every wallet, aggregator
            and lending market.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border/70 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.index} className="bg-background p-8">
              <span className="numeric font-serif text-sm text-accent">{step.index}</span>
              <h3 className="mt-6 font-serif text-xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: Layers,
      title: 'Composable by design',
      body: 'Shares are ERC-20s. Post them as collateral, route them through aggregators, or build a vault of vaults.',
    },
    {
      icon: Coins,
      title: 'Single-transaction exposure',
      body: 'Take a position in the whole basket at once. No five-step checkout, no idle balances.',
    },
    {
      icon: ShieldCheck,
      title: 'Weights on-chain',
      body: 'Every allocation is stored in basis points and enforced on each rebalance.',
    },
    {
      icon: Globe2,
      title: 'Open access',
      body: 'Create or invest from any wallet. Distribution is limited by the network, not by geography.',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow">Infrastructure</p>
      <h2 className="display mt-4 max-w-2xl text-4xl sm:text-5xl">
        Market exposure that behaves like a building block.
      </h2>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="panel group p-7 transition-colors hover:border-primary/30"
            >
              <span className="grid size-10 place-items-center rounded-xl border border-border bg-secondary/50 text-primary transition-colors group-hover:border-primary/30">
                <Icon className="size-4" />
              </span>
              <h3 className="mt-5 font-serif text-xl">{feature.title}</h3>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Closing() {
  return (
    <section className="relative border-y border-border/70">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(191,242,211,0.1),transparent_60%)]"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-28 text-center">
        <p className="eyebrow">Built for open markets</p>
        <h2 className="display mx-auto mt-6 max-w-2xl text-4xl sm:text-6xl">
          Package the thesis. Publish the vault.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          RobinFi is permissionless index infrastructure. Your strategy, your weights — open to
          anyone with a wallet.
        </p>

        <div className="mt-10 flex justify-center">
          <WalletButton label="Start building" className="px-7 py-3.5" />
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>© {new Date().getFullYear()} RobinFi · Testnet software, not investment advice.</p>
      <p className="flex items-center gap-2">
        <span
          className={`size-1.5 rounded-full ${isFactoryConfigured ? 'bg-primary' : 'bg-accent'}`}
        />
        {isFactoryConfigured ? 'Live on testnet' : 'Preview build · live vaults coming soon'}
      </p>
    </footer>
  )
}
