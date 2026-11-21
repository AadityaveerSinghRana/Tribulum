import { Calculator, Check } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { FormStatusBanner } from '../components/FormStatusBanner';
import { FPO_DEMO_PRESETS, FPO_PRICING_TIERS } from '../data/tribulumData';
import { submitFpoApplication, validateIndianPhone } from '../lib/supabase';

type FpoTierId = 'solo_fpo' | 'cluster' | 'full_konkan';

export function FpoMembershipPage() {
  const [calcAcres, setCalcAcres] = useState('400');
  const [calcTier, setCalcTier] = useState<FpoTierId>('cluster');

  const [fpoName, setFpoName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [memberCount, setMemberCount] = useState('');
  const [totalAcres, setTotalAcres] = useState('');
  const [pricingTier, setPricingTier] = useState<FpoTierId>('cluster');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [missingConfig, setMissingConfig] = useState(false);

  const selectedCalcTierObj =
    FPO_PRICING_TIERS.find((t) => t.id === calcTier) || FPO_PRICING_TIERS[1];

  const numericCalcAcres = Math.max(0, Number.parseFloat(calcAcres) || 0);
  const estimatedAnnualCost = Math.round(
    numericCalcAcres * selectedCalcTierObj.pricePerAcre
  );
  const standardSoloCost = Math.round(numericCalcAcres * 850);
  const savingsVsSolo = Math.max(0, standardSoloCost - estimatedAnnualCost);

  const fillFpoPreset = (targetTier: FpoTierId) => {
    const preset = FPO_DEMO_PRESETS[targetTier];
    setPricingTier(targetTier);
    setCalcTier(targetTier);
    setCalcAcres(preset.totalAcres);
    setFpoName(preset.fpoName);
    setContactName(preset.contactName);
    setPhone(preset.phone);
    setDistrict(`${preset.village}, ${preset.district}`);
    setMemberCount(preset.memberCount);
    setTotalAcres(preset.totalAcres);
    setStatus('idle');
    setStatusMessage(null);
    setMissingConfig(false);
  };

  const applyCalculatorToForm = () => {
    setPricingTier(calcTier);
    if (fpoName) {
      fillFpoPreset(calcTier);
    }
    const el = document.getElementById('fpo-apply-form');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      document.getElementById('fpo-name')?.focus();
    }, 300);
  };

  const handleTierChange = (nextTier: FpoTierId) => {
    setPricingTier(nextTier);
    if (fpoName) {
      fillFpoPreset(nextTier);
    }
  };

  const handleFormTabFill = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Tab') {
      fillFpoPreset(pricingTier);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMissingConfig(false);

    const preset = FPO_DEMO_PRESETS[pricingTier];
    const expectedDistrict = `${preset.village}, ${preset.district}`;

    // Ensure demo-only preset values are populated even if submitted without Tab (e.g. mobile tap)
    if (
      fpoName !== preset.fpoName ||
      contactName !== preset.contactName ||
      phone !== preset.phone ||
      district !== expectedDistrict ||
      memberCount !== preset.memberCount ||
      totalAcres !== preset.totalAcres
    ) {
      setFpoName(preset.fpoName);
      setContactName(preset.contactName);
      setPhone(preset.phone);
      setDistrict(expectedDistrict);
      setMemberCount(preset.memberCount);
      setTotalAcres(preset.totalAcres);
    }

    const cleanPhone = validateIndianPhone(preset.phone) || preset.phone;
    const parsedMembers = Number.parseInt(preset.memberCount, 10);
    const parsedAcres = Number.parseFloat(preset.totalAcres);

    setStatus('submitting');
    setStatusMessage(null);

    await submitFpoApplication({
      fpo_name: preset.fpoName,
      contact_name: preset.contactName,
      phone: cleanPhone,
      district: expectedDistrict,
      member_count: parsedMembers,
      total_acres: parsedAcres,
      pricing_tier: pricingTier,
    });

    const tierLabel =
      FPO_PRICING_TIERS.find((t) => t.id === pricingTier)?.name || 'FPO';
    setStatus('success');
    setStatusMessage(
      `${tierLabel} FPO sign-in successful for ${preset.fpoName} (${parsedAcres} acres, ${expectedDistrict}).`
    );
    setFpoName('');
    setContactName('');
    setPhone('');
    setDistrict('');
    setMemberCount('');
    setTotalAcres('');
  };

  return (
    <div className="bg-black pt-20 text-zinc-100">
      {/* Header */}
      <section className="border-b border-zinc-800 bg-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-medium text-zinc-400">
            Cluster &amp; Federation Pricing for Care
          </p>
          <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl">
            FPO Membership
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Aggregate acreage across FPO zones or farming spokes to lower the
            per-acre annual cost of Care monitoring (20 scans/yr, alert-to-action
            routing, and evidence records).
          </p>

          {/* 3 FPO Tier Cards */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {FPO_PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`flex flex-col justify-between rounded-xl border p-6 ${
                  tier.id === 'cluster'
                    ? 'border-emerald-500/70 bg-[#0E1311]'
                    : 'border-zinc-800 bg-[#0B0B0C]'
                }`}
              >
                <div>
                  <p className="text-xs font-medium text-zinc-400">
                    {tier.criteria}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-normal text-white">
                    {tier.name}
                  </h2>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-medium text-white tabular-nums">
                      {tier.priceDisplay}
                    </span>
                    <span className="text-xs text-zinc-400">/ acre / yr</span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                    {tier.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-zinc-800 pt-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>20 twice-monthly Care scans + routing</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator + Application Form */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Interactive Annual Cost Calculator */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-5">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
              <Calculator className="h-4 w-4" />
              <span>Annual Cost Calculator</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-normal text-white">
              Estimate your FPO annual cost
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Enter your FPO&apos;s enrolled acreage and select a Care pricing tier.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="calc-acres"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Total FPO Acreage (acres)
                </label>
                <input
                  id="calc-acres"
                  type="number"
                  min="1"
                  step="1"
                  value={calcAcres}
                  onChange={(e) => setCalcAcres(e.target.value)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-base text-white tabular-nums focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <span className="block text-xs font-medium text-zinc-300">
                  Select Care Pricing Tier
                </span>
                <div className="mt-2 space-y-2">
                  {FPO_PRICING_TIERS.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setCalcTier(tier.id)}
                      className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                        calcTier === tier.id
                          ? 'border-emerald-500/70 bg-[#132A21] font-medium text-white'
                          : 'border-zinc-800 bg-[#121214] text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <span>{tier.name}</span>
                      <span className="font-mono text-xs tabular-nums">
                        {tier.priceDisplay}/acre
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-black p-5 text-white">
                <p className="text-xs text-zinc-400">
                  Estimated Annual Cost ({numericCalcAcres.toLocaleString('en-IN')}{' '}
                  acres × {selectedCalcTierObj.priceDisplay})
                </p>
                <p className="mt-2 font-mono text-3xl font-medium tabular-nums">
                  ₹{estimatedAnnualCost.toLocaleString('en-IN')}
                  <span className="ml-1.5 text-xs font-normal text-zinc-400">
                    / year
                  </span>
                </p>
                {savingsVsSolo > 0 && (
                  <p className="mt-2 text-xs text-emerald-400 tabular-nums">
                    Saves ₹{savingsVsSolo.toLocaleString('en-IN')}/yr compared to
                    Solo FPO rate.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={applyCalculatorToForm}
                className="min-h-[44px] w-full cursor-pointer rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                Use this estimate in application
              </button>
            </div>
          </div>

          {/* FPO Application Form */}
          <div
            id="fpo-apply-form"
            className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-7"
          >
            <h2 className="font-serif text-2xl font-normal text-white">
              Apply for FPO Membership
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Select a field and press <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-200">Tab</kbd> to auto-fill demo FPO details.
            </p>

            <form
              onSubmit={handleSubmit}
              onKeyDown={handleFormTabFill}
              className="mt-6 space-y-4"
              noValidate
            >
              <FormStatusBanner
                status={status}
                message={statusMessage}
                missingConfig={missingConfig}
                successTitle="FPO sign-in successful"
                hideMissingBanner
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fpo-name"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    FPO / FPC Name *
                  </label>
                  <input
                    id="fpo-name"
                    type="text"
                    readOnly
                    value={fpoName}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fpo-contact"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Contact Person Name *
                  </label>
                  <input
                    id="fpo-contact"
                    type="text"
                    readOnly
                    value={contactName}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fpo-phone"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    id="fpo-phone"
                    type="tel"
                    readOnly
                    value={phone}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fpo-district"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Village / District *
                  </label>
                  <input
                    id="fpo-district"
                    type="text"
                    readOnly
                    value={district}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="fpo-members"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Member Count *
                  </label>
                  <input
                    id="fpo-members"
                    type="text"
                    readOnly
                    value={memberCount}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fpo-acres"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Total Acres *
                  </label>
                  <input
                    id="fpo-acres"
                    type="text"
                    readOnly
                    value={totalAcres}
                    placeholder="Press Tab to auto-fill"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fpo-tier"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Pricing Tier *
                  </label>
                  <select
                    id="fpo-tier"
                    value={pricingTier}
                    onChange={(e) => handleTierChange(e.target.value as FpoTierId)}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="solo_fpo">Solo FPO (₹850/acre)</option>
                    <option value="cluster">Cluster (₹800/acre)</option>
                    <option value="full_konkan">Full Konkan (₹780/acre)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#1F6F50] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#185840] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Submitting application...' : 'Apply'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
