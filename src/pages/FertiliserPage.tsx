import { type FormEvent, useEffect, useState } from 'react';
import { FormStatusBanner } from '../components/FormStatusBanner';
import { useAuth } from '../context/AuthContext';
import {
  FERTILISER_TOPICS,
  type FertiliserMode,
  MEDIA_ASSETS,
} from '../data/tribulumData';
import { submitFertiliserRequest, validateIndianPhone } from '../lib/supabase';

interface FertiliserPageProps {
  mode: FertiliserMode;
  onNavigate: (path: string) => void;
}

export function FertiliserPage({ mode, onNavigate }: FertiliserPageProps) {
  const { profile } = useAuth();
  const topic = FERTILISER_TOPICS[mode];

  const [crop, setCrop] = useState('');
  const [season, setSeason] = useState('Kharif');
  const [acres, setAcres] = useState('4');
  const [soilType, setSoilType] = useState('Lateritic Red');
  const [nVal, setNVal] = useState('');
  const [pVal, setPVal] = useState('');
  const [kVal, setKVal] = useState('');
  const [phVal, setPhVal] = useState('');
  const [phone, setPhone] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [missingConfig, setMissingConfig] = useState(false);

  useEffect(() => {
    if (!phone && profile?.phone) {
      setPhone(profile.phone.replace(/^\+91/, ''));
    }
  }, [profile]);

  useEffect(() => {
    setStatus('idle');
    setStatusMessage(null);
    setMissingConfig(false);
  }, [mode]);

  const parseOptionalNumber = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const num = Number.parseFloat(trimmed);
    return Number.isFinite(num) ? num : null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMissingConfig(false);

    const parsedAcres = Number.parseFloat(acres);
    const cleanPhone = validateIndianPhone(phone);

    if (!crop.trim()) {
      setStatus('error');
      setStatusMessage('Please enter your primary crop (e.g. Paddy, Mango, Pulses).');
      return;
    }
    if (!Number.isFinite(parsedAcres) || parsedAcres <= 0) {
      setStatus('error');
      setStatusMessage('Please enter valid acreage greater than 0.');
      return;
    }
    if (!cleanPhone) {
      setStatus('error');
      setStatusMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const parsedN = parseOptionalNumber(nVal);
    const parsedP = parseOptionalNumber(pVal);
    const parsedK = parseOptionalNumber(kVal);
    const parsedPh = parseOptionalNumber(phVal);

    if (parsedPh !== null && (parsedPh < 0 || parsedPh > 14)) {
      setStatus('error');
      setStatusMessage('Soil pH should be between 0 and 14.');
      return;
    }

    setStatus('submitting');
    setStatusMessage(null);

    const result = await submitFertiliserRequest({
      crop: crop.trim(),
      season,
      acres: parsedAcres,
      soil_type: soilType,
      n: parsedN,
      p: parsedP,
      k: parsedK,
      ph: parsedPh,
      phone: cleanPhone,
    });

    if (result.ok) {
      setStatus('success');
      setStatusMessage(
        `Fertiliser request submitted for ${parsedAcres} acres of ${crop.trim()} (${season}). Our agronomy desk will send a verified blend recommendation to ${cleanPhone}.`
      );
      setCrop('');
      setNVal('');
      setPVal('');
      setKVal('');
      setPhVal('');
      setPhone('');
    } else {
      setStatus('error');
      setMissingConfig(Boolean(result.missingConfig));
      setStatusMessage(result.error || 'Could not submit fertiliser request.');
    }
  };

  return (
    <div className="bg-black pt-20 text-zinc-100">
      <section className="border-b border-zinc-800 bg-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-6">
            {(Object.keys(FERTILISER_TOPICS) as FertiliserMode[]).map((key) => {
              const item = FERTILISER_TOPICS[key];
              const label =
                key === 'soil-test'
                  ? 'By Soil Test'
                  : key === 'crop-season'
                    ? 'By Crop and Season'
                    : 'Request a Custom Blend';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onNavigate(item.route)}
                  className={`min-h-[38px] cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    key === mode
                      ? 'bg-white text-black'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-10 max-w-3xl">
            <p className="text-xs font-medium text-emerald-400">{topic.eyebrow}</p>
            <h1 className="mt-2 font-serif text-4xl font-normal tracking-tight text-white sm:text-5xl">
              {topic.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
              {topic.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
          {/* Fertiliser Request Form */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-7">
            <h2 className="font-serif text-2xl font-normal text-white">
              Request a recommended blend
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              {topic.highlightNote}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              <FormStatusBanner
                status={status}
                message={statusMessage}
                missingConfig={missingConfig}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fert-crop"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Crop *
                  </label>
                  <input
                    id="fert-crop"
                    type="text"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    placeholder="e.g. Paddy (Indrayani) or Alphonso Mango"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fert-season"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Season *
                  </label>
                  <select
                    id="fert-season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Perennial / Orchard">Perennial / Orchard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fert-acres"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Acreage (acres) *
                  </label>
                  <input
                    id="fert-acres"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={acres}
                    onChange={(e) => setAcres(e.target.value)}
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white tabular-nums focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fert-soil"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Soil Type *
                  </label>
                  <select
                    id="fert-soil"
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Lateritic Red">Lateritic Red</option>
                    <option value="Black Cotton">Black Cotton</option>
                    <option value="Alluvial">Alluvial</option>
                    <option value="Coastal Sandy">Coastal Sandy</option>
                    <option value="Clay Loam">Clay Loam</option>
                  </select>
                </div>
              </div>

              {/* Optional Soil Test Values */}
              <div className="rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-xs font-medium text-zinc-300">
                  Optional Soil Test Values (from Soil Health Card)
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label
                      htmlFor="fert-n"
                      className="block text-xs text-zinc-400"
                    >
                      N (kg/ha)
                    </label>
                    <input
                      id="fert-n"
                      type="number"
                      step="0.1"
                      value={nVal}
                      onChange={(e) => setNVal(e.target.value)}
                      placeholder="e.g. 240"
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-1.5 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fert-p"
                      className="block text-xs text-zinc-400"
                    >
                      P (kg/ha)
                    </label>
                    <input
                      id="fert-p"
                      type="number"
                      step="0.1"
                      value={pVal}
                      onChange={(e) => setPVal(e.target.value)}
                      placeholder="e.g. 18"
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-1.5 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fert-k"
                      className="block text-xs text-zinc-400"
                    >
                      K (kg/ha)
                    </label>
                    <input
                      id="fert-k"
                      type="number"
                      step="0.1"
                      value={kVal}
                      onChange={(e) => setKVal(e.target.value)}
                      placeholder="e.g. 190"
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-1.5 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fert-ph"
                      className="block text-xs text-zinc-400"
                    >
                      pH
                    </label>
                    <input
                      id="fert-ph"
                      type="number"
                      step="0.1"
                      min="0"
                      max="14"
                      value={phVal}
                      onChange={(e) => setPhVal(e.target.value)}
                      placeholder="e.g. 6.4"
                      className="mt-1 min-h-[40px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-1.5 font-mono text-sm text-white tabular-nums placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="fert-phone"
                  className="block text-xs font-medium text-zinc-300"
                >
                  Farmer Mobile Number (10 digits) *
                </label>
                <input
                  id="fert-phone"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9820012345"
                  required
                  className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#1F6F50] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#185840] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Sending request...' : 'Submit request'}
              </button>
            </form>
          </div>

          {/* Full-Care NIR Testing Explainer */}
          <div className="space-y-6 lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#0B0B0C]">
              <img
                src={MEDIA_ASSETS.nirGrainTesting}
                alt="Portable NIR grain quality scanner measuring harvested paddy"
                referrerPolicy="no-referrer"
                className="aspect-4/3 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-xs font-medium text-emerald-400">
                  Full-Care Advantage · 8 NIR Tests / Year
                </p>
                <h3 className="mt-2 font-serif text-2xl font-normal text-white">
                  How Full-Care NIR testing improves fertiliser blends
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  Soil tests tell you what is sitting in the ground, while
                  Full-Care&apos;s 8 annual portable Near-Infrared (NIR) grain and
                  produce tests measure what your crop actually absorbed at
                  harvest—protein, moisture, and nutrient-use efficiency.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Pairing NIR harvest results with your next-season fertiliser
                  request prevents over-applying nitrogen or missing key
                  micronutrients, lowering input spend without risking yield.
                </p>

                <button
                  type="button"
                  onClick={() => onNavigate('/membership/full-care')}
                  className="mt-5 inline-flex min-h-[40px] cursor-pointer items-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800"
                >
                  Explore Full-Care (₹1,050/acre/yr)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
