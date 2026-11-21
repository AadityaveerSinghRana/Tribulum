import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import { Check, Star } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export interface PricingPlan {
  name: string;
  price: string;
  alternatePrice: string;
  period: string;
  alternatePeriod: string;
  scansBadge: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
  onSelectPlan?: (href: string) => void;
}

export function Pricing({
  plans,
  title = "Annual crop-monitoring memberships",
  description = "Prices are per acre per year (two seasons), sold through FPOs.\nSprays are a pass-through at the partner's rate and are not bundled.",
  onSelectPlan,
}: PricingProps) {
  const [isSingleAcre, setIsSingleAcre] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsSingleAcre(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      confetti({
        particleCount: 45,
        spread: 60,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight,
        },
        colors: ["#34D399", "#1F6F50", "#D4A373", "#E4E4E7"],
        ticks: 180,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 28,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-4 text-center">
        <p className="text-xs font-medium text-zinc-400">
          Individual FPO Member Plans
        </p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-white sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto max-w-2xl whitespace-pre-line text-base leading-relaxed text-zinc-400 sm:text-lg">
          {description}
        </p>
      </div>

      {/* Acreage Scale Switch */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
        <span
          className={cn(
            "text-sm font-medium transition-colors",
            isSingleAcre ? "text-white" : "text-zinc-400"
          )}
        >
          1 acre / year
        </span>
        <Label
          htmlFor="acreage-scale-switch"
          className="inline-flex cursor-pointer items-center"
        >
          <Switch
            id="acreage-scale-switch"
            ref={switchRef}
            checked={!isSingleAcre}
            onCheckedChange={handleToggle}
          />
        </Label>
        <span
          className={cn(
            "text-sm font-semibold transition-colors",
            !isSingleAcre ? "text-emerald-400" : "text-zinc-400"
          )}
        >
          5-acre farm estimate{" "}
          <span className="font-normal text-zinc-500">(2 seasons)</span>
        </span>
      </div>

      {/* Cards Grid */}
      <div
        className={cn(
          "grid grid-cols-1 gap-5 md:grid-cols-2",
          plans.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
        )}
      >
        {plans.map((plan, index) => {
          const displayedPrice = isSingleAcre
            ? Number(plan.price)
            : Number(plan.alternatePrice);
          const displayedPeriod = isSingleAcre
            ? plan.period
            : plan.alternatePeriod;

          return (
            <motion.div
              key={plan.name}
              initial={{ y: 36, opacity: 0.9 }}
              whileInView={
                isDesktop
                  ? {
                      y: plan.isPopular ? -14 : 0,
                      opacity: 1,
                      scale: plan.isPopular ? 1.03 : 0.97,
                    }
                  : { y: 0, opacity: 1, scale: 1 }
              }
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.9,
                type: "spring",
                stiffness: 120,
                damping: 24,
                delay: index * 0.08,
                opacity: { duration: 0.4 },
              }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-[#0A0A0B] p-6 text-center transition-shadow duration-200",
                plan.isPopular
                  ? "z-10 border-2 border-emerald-500/80 shadow-2xl"
                  : "z-0 border-zinc-800 lg:mt-4"
              )}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 flex items-center rounded-bl-xl rounded-tr-xl bg-[#1F6F50] px-2.5 py-1">
                  <Star className="h-3.5 w-3.5 fill-current text-white" />
                  <span className="ml-1 font-sans text-xs font-semibold text-white">
                    Most popular
                  </span>
                </div>
              )}

              <div className="flex flex-1 flex-col">
                <p className="text-sm font-semibold tracking-wide text-zinc-400">
                  {plan.name}
                </p>

                <div className="mt-5 flex items-baseline justify-center gap-x-1.5">
                  <span className="font-mono text-4xl font-semibold tracking-tight text-white tabular-nums sm:text-5xl">
                    <NumberFlow
                      value={displayedPrice}
                      locales="en-IN"
                      format={{
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }}
                      transformTiming={{
                        duration: 450,
                        easing: "ease-out",
                      }}
                      willChange
                      className="tabular-nums"
                    />
                  </span>
                  <span className="text-xs font-medium text-zinc-400">
                    / {displayedPeriod}
                  </span>
                </div>

                <p className="mt-1.5 font-mono text-xs text-zinc-400 tabular-nums">
                  {plan.scansBadge}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm text-zinc-300">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-left">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <hr className="my-5 w-full border-zinc-800" />

                <a
                  href={plan.href}
                  onClick={(e) => {
                    if (onSelectPlan) {
                      e.preventDefault();
                      onSelectPlan(plan.href);
                    }
                  }}
                  className={cn(
                    buttonVariants({
                      variant: plan.isPopular ? "default" : "outline",
                    }),
                    "group relative min-h-[44px] w-full gap-2 overflow-hidden text-sm font-semibold",
                    "transition-all duration-200 ease-out hover:bg-[#1F6F50] hover:text-white hover:border-[#1F6F50]",
                    plan.isPopular
                      ? "bg-[#1F6F50] text-white"
                      : "border-zinc-700 bg-zinc-900 text-white"
                  )}
                >
                  {plan.buttonText}
                </a>

                <p className="mt-4 text-xs leading-relaxed text-zinc-400">
                  {plan.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
