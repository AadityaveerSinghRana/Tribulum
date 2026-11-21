import { ArrowRight, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { HowItWorksStrip } from '../components/HowItWorksStrip';
import { GeminiAdvisorCard } from '../components/GeminiAdvisorCard';
import { Pricing, type PricingPlan } from '../components/ui/pricing';
import {
  FPO_PRICING_TIERS,
  HOW_IT_WORKS_STEPS,
  KONKAN_BELTS,
  MEDIA_ASSETS,
  MEMBERSHIP_TIERS,
  VILLAGE_PACKS,
} from '../data/tribulumData';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const HERO_SLIDES = [
  {
    id: 'konkan',
    image: MEDIA_ASSETS.heroKonkanFields,
    alt: 'Terraced green paddy fields and mango orchards in Konkan at sunrise with a survey drone overhead',
    vignetteLabel: '01 · Satellite triage & drone check',
    vignetteText: 'Plot 14B · Canopy dip flagged → Drone sortie routed',
  },
  {
    id: 'coordinator',
    image: MEDIA_ASSETS.heroFarmerCoordinator,
    alt: 'Indian farmer and FPO field coordinator reviewing crop health maps on a tablet at sunrise',
    vignetteLabel: '02 · Local voice alert & FPO routing',
    vignetteText: 'Marathi voice alert delivered · FPO coordinator assigned',
  },
  {
    id: 'mosaic',
    image: MEDIA_ASSETS.aerialPlotMosaic,
    alt: 'High-altitude aerial view of structured Indian agricultural plots and irrigation bunds',
    vignetteLabel: '03 · Two-season evidence record',
    vignetteText: '20 scans logged across Kharif & Rabi · Partner spray rate transparent',
  },
] as const;

export function HomePage({ onNavigate }: HomePageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  const currentSlide = HERO_SLIDES[slideIndex];
  const activeStep = HOW_IT_WORKS_STEPS[activeStepIndex];

  const scrollToMemberships = () => {
    const el = document.getElementById('membership-tiers');
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <div className="bg-black text-zinc-100">
      {/* 1. Full-bleed Editorial Hero */}
      <section className="relative flex min-h-[88vh] w-full flex-col justify-end overflow-hidden bg-black text-white">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.alt}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Contrast Scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/50"
        />

        {/* Hero Foreground */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-16 pt-32 text-center sm:px-6 lg:px-8 lg:pb-20">
          <div className="mb-12 hidden max-w-xl rounded-xl border border-white/15 bg-black/55 px-5 py-3.5 backdrop-blur-md sm:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -6 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-1"
              >
                <span className="font-mono text-xs text-zinc-300">
                  {currentSlide.vignetteLabel}
                </span>
                <p className="text-sm font-medium text-white">
                  {currentSlide.vignetteText}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <h1 className="max-w-3xl font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl lg:text-6xl">
            Crop monitoring, without guesswork.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg">
            Drone and satellite memberships for Indian farmers, sold per acre per
            year through Farmer Producer Organisations (FPOs).
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={scrollToMemberships}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition-colors duration-150 hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Explore Memberships</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/membership/fpo')}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg border border-white/30 bg-black/40 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>FPO &amp; Village Packs</span>
            </button>
          </div>

          <div className="mt-10 flex items-center gap-2" role="tablist" aria-label="Hero scenes">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={idx === slideIndex}
                aria-label={`View scene ${idx + 1}`}
                onClick={() => setSlideIndex(idx)}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                  idx === slideIndex ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/65'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Regional FPO Trust Strip */}
      <section className="border-y border-zinc-800 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <p className="text-xs font-medium text-zinc-400">
              Built for two-season coverage across Indian FPO clusters
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs font-medium text-zinc-200">
              {KONKAN_BELTS.map((belt) => (
                <span key={belt} className="whitespace-nowrap">
                  {belt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Editorial Intro + Dark Interactive Platform Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl">
            From satellite triage to field action in four clear steps.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Prices are per acre per year covering two seasons through your FPO.
            Sprays are a pass-through at the partner&apos;s rate and are never bundled.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-zinc-800 bg-[#0B0B0C] text-white">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
            {/* Left Interactive Step List */}
            <div className="flex flex-col justify-between border-b border-zinc-800 p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
              <div className="space-y-2">
                {HOW_IT_WORKS_STEPS.map((step, idx) => {
                  const isActive = idx === activeStepIndex;
                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => setActiveStepIndex(idx)}
                      className={`flex w-full cursor-pointer items-start justify-between gap-4 rounded-xl p-4 text-left transition-colors duration-150 ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                      }`}
                    >
                      <div>
                        <span className="font-mono text-xs text-zinc-400 tabular-nums">
                          {step.number}. {step.title}
                        </span>
                        <p className="mt-1 text-sm font-medium text-inherit">
                          {step.headline}
                        </p>
                      </div>
                      <ChevronRight
                        className={`mt-1 h-4 w-4 shrink-0 transition-transform ${
                          isActive ? 'translate-x-0.5 text-white' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 border-t border-zinc-800 pt-5">
                <p className="text-xs leading-relaxed text-zinc-400">
                  Every Care and Full-Care plot links directly to FPO field
                  coordinators, keeping seasonal records clean and spray decisions
                  independent.
                </p>
              </div>
            </div>

            {/* Right Visual & Detail Panel */}
            <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-7">
              <div className="relative aspect-16/9 w-full overflow-hidden rounded-xl bg-zinc-900">
                <img
                  src={
                    activeStepIndex % 2 === 0
                      ? MEDIA_ASSETS.aerialPlotMosaic
                      : MEDIA_ASSETS.heroFarmerCoordinator
                  }
                  alt={activeStep.headline}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-zinc-300">
                      Step {activeStep.number} · {activeStep.title}
                    </p>
                    <p className="mt-0.5 font-serif text-xl text-white">
                      {activeStep.headline}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-zinc-300">
                {activeStep.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Membership Tiers Section (shadcn Pricing Layout) */}
      <section
        id="membership-tiers"
        className="border-y border-zinc-800 bg-black"
      >
        <Pricing
          plans={MEMBERSHIP_TIERS.map(
            (tier): PricingPlan => ({
              name: tier.name.toUpperCase(),
              price: String(tier.pricePerAcre),
              alternatePrice: String(tier.pricePerAcre * 5),
              period: 'acre / yr',
              alternatePeriod: '5 acres / yr',
              scansBadge: tier.scansLabel,
              features: tier.includes,
              description: tier.shortSummary,
              buttonText: `Enrol in ${tier.name}`,
              href: tier.route,
              isPopular: Boolean(tier.popular),
            })
          )}
          title="Annual crop-monitoring memberships"
          description={
            'Prices are per acre per year (two seasons), sold through FPOs.\nSprays are a pass-through at the partner’s rate and are not bundled.'
          }
          onSelectPlan={onNavigate}
        />

        <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#0B0B0C] text-xs font-medium text-zinc-400">
                  <th className="px-5 py-3.5">Tier</th>
                  <th className="px-5 py-3.5">Includes</th>
                  <th className="px-5 py-3.5">Scans / yr</th>
                  <th className="px-5 py-3.5 text-right">Price / acre / yr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-[#060607]">
                {MEMBERSHIP_TIERS.map((tier) => (
                  <tr
                    key={tier.slug}
                    onClick={() => onNavigate(tier.route)}
                    className="cursor-pointer transition-colors hover:bg-zinc-900/70"
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {tier.name}
                      {tier.popular && (
                        <span className="ml-2 text-xs font-medium text-emerald-400">
                          · Most popular
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-300">{tier.shortSummary}</td>
                    <td className="px-5 py-4 font-mono text-xs text-zinc-300 tabular-nums">
                      {tier.scansPerYear}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-medium text-white tabular-nums">
                      {tier.priceDisplay}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. FPO Cluster & Village Gaon Packs Split */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {/* FPO Membership Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-8">
            <div>
              <p className="text-xs font-medium text-zinc-400">
                FPO Cluster Pricing for Care
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal text-white">
                FPO Membership
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Scale Care monitoring across zones and spokes to unlock lower
                per-acre rates for every member farmer.
              </p>

              <div className="mt-6 divide-y divide-zinc-800 border-y border-zinc-800">
                {FPO_PRICING_TIERS.map((fpo) => (
                  <div
                    key={fpo.id}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{fpo.name}</p>
                      <p className="text-xs text-zinc-400">{fpo.criteria}</p>
                    </div>
                    <span className="font-mono text-base font-medium text-white tabular-nums">
                      {fpo.priceDisplay}/acre
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/membership/fpo')}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#1F6F50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#185840]"
              >
                <span>Open FPO Calculator &amp; Apply</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Village Membership Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-8">
            <div>
              <p className="text-xs font-medium text-zinc-400">
                Whole-Village Collective Unit
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal text-white">
                Village Membership (Gaon packs)
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                The village signs as one unit and a local resident operator is
                trained by Tribulum to coordinate alerts, ground verification, and
                season records.
              </p>

              <div className="mt-6 divide-y divide-zinc-800 border-y border-zinc-800">
                {VILLAGE_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between gap-4 py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {pack.name}
                        {pack.popular && (
                          <span className="ml-2 text-xs font-medium text-emerald-400">
                            · Common unit
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {pack.acresTarget}+ collective village acres
                      </p>
                    </div>
                    <span className="font-mono text-base font-medium text-white tabular-nums">
                      {pack.priceDisplay}/acre
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/membership/village')}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                <span>Explore Gaon Packs &amp; Apply</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customise Fertiliser & NIR Produce Testing Block */}
      <section className="border-t border-zinc-800 bg-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 lg:col-span-5">
              <img
                src={MEDIA_ASSETS.nirGrainTesting}
                alt="Portable NIR grain quality scanner beside harvested paddy grain baskets"
                referrerPolicy="no-referrer"
                className="h-full min-h-[280px] w-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-xs font-medium text-emerald-400">
                Customise Fertiliser &amp; NIR Produce Intelligence
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight text-white sm:text-4xl">
                Nutrient recommendations anchored to soil tests and real harvest uptake.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-300">
                Submit your crop, season, acreage, and optional Soil Health Card
                readings (N, P, K, pH) to request a verified blend. On Full-Care,
                8 annual NIR grain and produce tests show what your crop actually
                absorbed—improving next-season recommendations.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/fertiliser/soil-test')}
                  className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-[#0B0B0C] px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:border-zinc-600 hover:bg-zinc-900"
                >
                  <span>By Soil Test</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/fertiliser/crop-season')}
                  className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-[#0B0B0C] px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:border-zinc-600 hover:bg-zinc-900"
                >
                  <span>By Crop &amp; Season</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/fertiliser/custom-blend')}
                  className="flex min-h-[44px] cursor-pointer items-center justify-between rounded-lg border border-zinc-800 bg-[#0B0B0C] px-4 py-3 text-left text-sm font-medium text-white transition-colors hover:border-zinc-600 hover:bg-zinc-900"
                >
                  <span>Custom Blend</span>
                  <ArrowRight className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works & Callback CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-zinc-400">Operational Cadence</p>
            <h2 className="mt-1 font-serif text-3xl font-normal text-white">
              Scan → Alert → Action → Record
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/contact/callback')}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-[#1F6F50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#185840]"
          >
            <span>Request a Callback</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <HowItWorksStrip variant="dark" />
      </section>

      {/* 8. Free Gemini 4 Hydrogen Crop & Membership Advisor */}
      <section className="border-t border-zinc-800 bg-black py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium text-emerald-400">
                Instant Multilingual Guidance
              </p>
              <h2 className="mt-1 font-serif text-3xl font-normal text-white">
                Not sure which plan fits your crop?
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/auth')}
              className="inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              <span>Sign in to Account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <GeminiAdvisorCard />
        </div>
      </section>
    </div>
  );
}
