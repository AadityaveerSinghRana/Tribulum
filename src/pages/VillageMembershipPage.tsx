import { Check } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useState } from 'react';
import { FormStatusBanner } from '../components/FormStatusBanner';
import {
  MEDIA_ASSETS,
  VILLAGE_DEMO_PRESETS,
  VILLAGE_PACKS,
} from '../data/tribulumData';
import { submitVillageApplication, validateIndianPhone } from '../lib/supabase';

type GaonPackId = 'gaon_50' | 'gaon_100' | 'gaon_200';

export function VillageMembershipPage() {
  const [village, setVillage] = useState('');
  const [packSize, setPackSize] = useState<GaonPackId>('gaon_100');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [missingConfig, setMissingConfig] = useState(false);

  const fillVillagePreset = (targetPack: GaonPackId) => {
    const preset = VILLAGE_DEMO_PRESETS[targetPack];
    setPackSize(targetPack);
    setVillage(preset.village);
    setContactName(preset.contactName);
    setPhone(preset.phone);
    setDistrict(preset.district);
    setStatus('idle');
    setStatusMessage(null);
    setMissingConfig(false);
  };

  const selectPack = (id: GaonPackId) => {
    setPackSize(id);
    if (village) {
      fillVillagePreset(id);
    }
    const el = document.getElementById('village-apply-form');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => {
      document.getElementById('village-name')?.focus();
    }, 300);
  };

  const handlePackChange = (nextPack: GaonPackId) => {
    setPackSize(nextPack);
    if (village) {
      fillVillagePreset(nextPack);
    }
  };

  const handleFormTabFill = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Tab') {
      fillVillagePreset(packSize);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMissingConfig(false);

    const preset = VILLAGE_DEMO_PRESETS[packSize];

    // Ensure demo-only preset values are populated even if submitted without Tab (e.g. mobile tap)
    if (
      village !== preset.village ||
      contactName !== preset.contactName ||
      phone !== preset.phone ||
      district !== preset.district
    ) {
      setVillage(preset.village);
      setContactName(preset.contactName);
      setPhone(preset.phone);
      setDistrict(preset.district);
    }

    const cleanPhone = validateIndianPhone(preset.phone) || preset.phone;

    setStatus('submitting');
    setStatusMessage(null);

    await submitVillageApplication({
      village: preset.village,
      pack_size: packSize,
      contact_name: preset.contactName,
      phone: cleanPhone,
      district: preset.district,
    });

    const packLabel =
      VILLAGE_PACKS.find((p) => p.id === packSize)?.name || 'Gaon Pack';
    setStatus('success');
    setStatusMessage(
      `${packLabel} sign-in successful for ${preset.village} (${preset.contactName}, ${preset.district}).`
    );
    setVillage('');
    setContactName('');
    setPhone('');
    setDistrict('');
  };

  return (
    <div className="bg-black pt-20 text-zinc-100">
      {/* Header */}
      <section className="border-b border-zinc-800 bg-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium text-zinc-400">
                Collective Village Unit &amp; Local Operator Training
              </p>
              <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl">
                Village Membership (Gaon packs)
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-300 sm:text-lg">
                The village signs as one unit and a local resident operator is
                trained by Tribulum to map plot boundaries, relay voice alerts,
                and support seasonal ground verification across every member farm.
              </p>

              <ul className="mt-6 space-y-2.5 text-sm text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>One unified village agreement across two cropping seasons</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Hands-on training for a local youth / village operator</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Transparent pass-through partner spray rates (never bundled)</span>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 lg:col-span-5">
              <img
                src={MEDIA_ASSETS.heroFarmerCoordinator}
                alt="Village coordinator and farmer reviewing crop health alerts on tablet"
                referrerPolicy="no-referrer"
                className="aspect-4/3 h-full w-full object-cover"
              />
            </div>
          </div>

          {/* 3 Gaon Packs */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {VILLAGE_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`flex flex-col justify-between rounded-xl border p-6 transition-colors ${
                  packSize === pack.id
                    ? 'border-emerald-500/70 bg-[#0E1311]'
                    : 'border-zinc-800 bg-[#0B0B0C]'
                }`}
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-serif text-2xl font-normal text-white">
                      {pack.name}
                    </h2>
                    {pack.popular && (
                      <span className="text-xs font-semibold text-emerald-400">
                        Common unit
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl font-medium text-white tabular-nums">
                      {pack.priceDisplay}
                    </span>
                    <span className="text-xs text-zinc-400">/ acre / yr</span>
                  </div>

                  <p className="mt-1 font-mono text-xs text-zinc-400 tabular-nums">
                    {pack.acresTarget}+ collective acres
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                    {pack.description}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => selectPack(pack.id)}
                    className={`min-h-[44px] w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                      packSize === pack.id
                        ? 'bg-[#1F6F50] text-white hover:bg-[#185840]'
                        : 'border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800'
                    }`}
                  >
                    {packSize === pack.id ? `Selected: ${pack.name}` : `Select ${pack.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Village Application Form */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          id="village-apply-form"
          className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-10"
        >
          <h2 className="font-serif text-3xl font-normal text-white">
            Apply for a Village Gaon Pack
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Select a field and press <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] text-zinc-200">Tab</kbd> to auto-fill demo village details.
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
              successTitle="Gaon Pack sign-in successful"
              hideMissingBanner
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="village-name"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Village / Gram Panchayat Name *
                </label>
                <input
                  id="village-name"
                  type="text"
                  readOnly
                  value={village}
                  placeholder="Press Tab to auto-fill"
                  required
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="village-pack"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Gaon Pack Size *
                </label>
                <select
                  id="village-pack"
                  value={packSize}
                  onChange={(e) => handlePackChange(e.target.value as GaonPackId)}
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="gaon_50">Gaon-50 (₹820/acre)</option>
                  <option value="gaon_100">Gaon-100 (₹780/acre)</option>
                  <option value="gaon_200">Gaon-200 (₹740/acre)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="village-contact"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Contact Name *
                </label>
                <input
                  id="village-contact"
                  type="text"
                  readOnly
                  value={contactName}
                  placeholder="Press Tab to auto-fill"
                  required
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="village-phone"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Mobile Number (10 digits) *
                </label>
                <input
                  id="village-phone"
                  type="tel"
                  readOnly
                  value={phone}
                  placeholder="Press Tab to auto-fill"
                  required
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="village-district"
                className="block text-xs font-medium text-zinc-300"
              >
                District *
              </label>
              <input
                id="village-district"
                type="text"
                readOnly
                value={district}
                placeholder="Press Tab to auto-fill"
                required
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
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
      </section>
    </div>
  );
}
