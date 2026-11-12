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
            Tokenized equity · Robinhood Chain
          </p>

          <h1 className="display mt-6 text-5xl sm:text-6xl lg:text-[4.75rem]">
            Own the index.
            <br />
            Not the <em className="font-normal italic text-accent">paperwork</em>.
          </h1>

          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Package tokenized stocks into a shareable index vault. One deposit, instant
            diversification, and ERC-4626 shares you can take anywhere in DeFi.
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
              { value: '0', label: 'Custodians' },
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
              {vault.tokens.length} names · equal-weight
            </p>
          </div>
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-primary">
            Live
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
        <p className="eyebrow shrink-0">Index constituents</p>
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
            Buying five stocks is a chore. Owning an <em className="italic text-accent">index</em>{' '}
            is a decision.
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            A vault bundles a basket of tokenized equities into one asset. You deposit once,
            hold transferable shares, and the weights stay honest. No broker, no minimum, no
            set of five separate orders every time conviction changes.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Non-custodial by design',
                body: 'Shares live in your wallet. The vault holds assets; it never holds your keys.',
              },
              {
                title: 'Open issuance',
                body: 'Anyone can launch a vault and seed it. The marketplace decides what matters.',
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
      title: 'Pick the names',
      body: 'Choose up to five tokenized stocks and set equal-weight or custom allocations in basis points.',
    },
    {
      index: '02',
      title: 'Deploy the vault',
      body: 'The factory deploys an ERC-4626 vault that mints transferable shares against ETH deposits.',
    },
    {
      index: '03',
      title: 'Deposit or launch',
      body: 'Seed it yourself, or open it to the marketplace and let anyone deposit into your strategy.',
    },
  ]

  return (
    <section id="how" className="border-t border-border/70 bg-secondary/20">
      <div className="mx-auto max-w-6xl px-4 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="display mt-4 text-4xl sm:text-5xl">Three moves, one vault.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Built on the ERC-4626 tokenized-vault standard, so shares are legible to every
            wallet, aggregator and lending market from day one.
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
      title: 'Composable shares',
      body: 'Vault shares are ERC-20s. Use them as collateral, route them through aggregators, or build a vault of vaults.',
    },
    {
      icon: Coins,
      title: 'One deposit',
      body: 'Exposure to the whole basket in a single transaction. No five-step checkout, no dust.',
    },
    {
      icon: ShieldCheck,
      title: 'Transparent weights',
      body: 'Allocations are stored on-chain in basis points and verified on every rebalance.',
    },
    {
      icon: Globe2,
      title: 'Borderless access',
      body: 'Anyone with a wallet can create or buy. Markets stop at the edge of the network, not at a border.',
    },
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <p className="eyebrow">The infrastructure</p>
      <h2 className="display mt-4 max-w-2xl text-4xl sm:text-5xl">
        An index fund that behaves like a primitive.
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
        <p className="eyebrow">For a world without market borders</p>
        <h2 className="display mx-auto mt-6 max-w-2xl text-4xl sm:text-6xl">
          Build the basket. Let everyone else own it.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          RobinFi is a permissionless index factory. The strategy is yours; the access is
          public.
        </p>

        <div className="mt-10 flex justify-center">
          <WalletButton label="Launch a vault" className="px-7 py-3.5" />
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
        {isFactoryConfigured ? 'Factory configured' : 'Contracts awaiting testnet deployment'}
      </p>
    </footer>
  )
}
