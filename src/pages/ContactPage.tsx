import { type FormEvent, useEffect, useState } from 'react';
import { FormStatusBanner } from '../components/FormStatusBanner';
import { useAuth } from '../context/AuthContext';
import {
  CALLBACK_SLOTS,
  CONTACT_TOPICS,
  type ContactMode,
} from '../data/tribulumData';
import {
  submitCallbackRequest,
  submitContactMessage,
  validateIndianPhone,
} from '../lib/supabase';

interface ContactPageProps {
  mode: ContactMode;
  onNavigate: (path: string) => void;
}

export function ContactPage({ mode, onNavigate }: ContactPageProps) {
  const { profile } = useAuth();
  const topic = CONTACT_TOPICS[mode];
  const isCallback = mode === 'callback';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [villageOrFpo, setVillageOrFpo] = useState('');
  const [message, setMessage] = useState('');
  const [preferredSlot, setPreferredSlot] = useState<string>(CALLBACK_SLOTS[0]);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [missingConfig, setMissingConfig] = useState(false);

  useEffect(() => {
    if (!profile) return;
    if (!name && profile.full_name) setName(profile.full_name);
    if (!phone && profile.phone) setPhone(profile.phone.replace(/^\+91/, ''));
    if (!villageOrFpo && (profile.fpo_name || profile.village)) {
      setVillageOrFpo(profile.fpo_name || profile.village || '');
    }
  }, [profile]);

  useEffect(() => {
    setStatus('idle');
    setStatusMessage(null);
    setMissingConfig(false);
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMissingConfig(false);

    const cleanPhone = validateIndianPhone(phone);
    if (!name.trim()) {
      setStatus('error');
      setStatusMessage('Please enter your full name.');
      return;
    }
    if (!cleanPhone) {
      setStatus('error');
      setStatusMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (isCallback) {
      setStatus('submitting');
      setStatusMessage(null);

      const result = await submitCallbackRequest({
        name: name.trim(),
        phone: cleanPhone,
        preferred_slot: preferredSlot,
      });

      if (result.ok) {
        setStatus('success');
        setStatusMessage(
          `Callback scheduled for ${preferredSlot}. We will reach out to ${cleanPhone}.`
        );
        setName('');
        setPhone('');
      } else {
        setStatus('error');
        setMissingConfig(Boolean(result.missingConfig));
        setStatusMessage(result.error || 'Could not request callback.');
      }
      return;
    }

    if (!message.trim()) {
      setStatus('error');
      setStatusMessage('Please include a brief message so our team can respond accurately.');
      return;
    }

    setStatus('submitting');
    setStatusMessage(null);

    const formattedMessage = villageOrFpo.trim()
      ? `Village / FPO: ${villageOrFpo.trim()}\n\n${message.trim()}`
      : message.trim();

    const result = await submitContactMessage({
      type: topic.typeValue || 'team',
      name: name.trim(),
      phone: cleanPhone,
      message: formattedMessage,
    });

    if (result.ok) {
      setStatus('success');
      setStatusMessage(
        `Your message has been logged under ${topic.title}. A regional coordinator will follow up at ${cleanPhone}.`
      );
      setName('');
      setPhone('');
      setVillageOrFpo('');
      setMessage('');
    } else {
      setStatus('error');
      setMissingConfig(Boolean(result.missingConfig));
      setStatusMessage(result.error || 'Could not send message.');
    }
  };

  return (
    <div className="bg-black pt-20 text-zinc-100">
      <section className="border-b border-zinc-800 bg-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-6">
            {(Object.keys(CONTACT_TOPICS) as ContactMode[]).map((key) => {
              const item = CONTACT_TOPICS[key];
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
                  {item.title}
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
          <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <FormStatusBanner
                status={status}
                message={statusMessage}
                missingConfig={missingConfig}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pravin Patil"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Mobile Number (10 digits) *
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9820012345"
                    required
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 font-mono text-sm text-white placeholder:font-sans placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {isCallback ? (
                <div>
                  <label
                    htmlFor="callback-slot"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Preferred Time Slot *
                  </label>
                  <select
                    id="callback-slot"
                    value={preferredSlot}
                    onChange={(e) => setPreferredSlot(e.target.value)}
                    className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {CALLBACK_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="contact-village-fpo"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Village / FPO Name
                    </label>
                    <input
                      id="contact-village-fpo"
                      type="text"
                      value={villageOrFpo}
                      onChange={(e) => setVillageOrFpo(e.target.value)}
                      placeholder="e.g. Ratnagiri Agro FPC or Kankavli"
                      className="mt-1.5 min-h-[44px] w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium text-zinc-300"
                    >
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={topic.placeholderMessage}
                      required
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-[#121214] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#1F6F50] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#185840] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting'
                  ? 'Submitting...'
                  : isCallback
                    ? 'Request callback'
                    : 'Send message'}
              </button>
            </form>
          </div>

          {/* Direct Channels Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0C] p-6 sm:p-8 lg:col-span-5">
            <h2 className="font-serif text-2xl font-normal text-white">
              Regional Desk &amp; Voice Support
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Our field coordinators operate across Konkan and Western Maharashtra
              spokes with voice support in Marathi, Hindi, and English.
            </p>

            <dl className="mt-6 divide-y divide-zinc-800 border-y border-zinc-800 text-sm">
              <div className="flex justify-between py-3.5">
                <dt className="text-zinc-400">Farmer Helpline</dt>
                <dd className="font-mono text-white tabular-nums">+91 22 4000 0000</dd>
              </div>
              <div className="flex justify-between py-3.5">
                <dt className="text-zinc-400">Hours</dt>
                <dd className="text-white">Mon–Sat · 8 AM – 8 PM</dd>
              </div>
              <div className="flex justify-between py-3.5">
                <dt className="text-zinc-400">Email</dt>
                <dd className="text-white">namaste@tribulum.in</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
