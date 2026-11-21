import { useState } from 'react';
import { MEMBERSHIP_TIERS } from '../data/tribulumData';

interface FooterProps {
  onNavigate: (path: string) => void;
}

type LanguageLabel = 'English' | 'Marathi' | 'Hindi';

export function Footer({ onNavigate }: FooterProps) {
  const [language, setLanguage] = useState<LanguageLabel>('English');

  return (
    <footer className="border-t border-zinc-800 bg-black text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand & About */}
          <div className="md:col-span-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="cursor-pointer font-serif text-2xl font-normal text-white"
            >
              Tribulum
            </button>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
              Drone and satellite crop-monitoring memberships for Indian farmers,
              sold per acre per year through Farmer Producer Organisations
              (FPOs). Two seasons of structured observation, local voice alerts,
              and field evidence.
            </p>
            <div className="mt-6 space-y-1 text-xs text-stone-400">
              <p>Farmer &amp; FPO Desk: +91 22 4000 0000</p>
              <p>Email: namaste@tribulum.in</p>
              <p>Konkan &amp; Western Maharashtra Operations</p>
            </div>
          </div>

          {/* Membership Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-white">Membership</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {MEMBERSHIP_TIERS.map((tier) => (
                <li key={tier.slug}>
                  <button
                    type="button"
                    onClick={() => onNavigate(tier.route)}
                    className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                  >
                    {tier.name} · {tier.priceDisplay}/acre/yr
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/membership/village')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  Village Membership (Gaon packs)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/membership/fpo')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  FPO Membership
                </button>
              </li>
            </ul>
          </div>

          {/* Fertiliser & Contact */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-white">
              Customise Fertiliser
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/fertiliser/soil-test')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  By Soil Test
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/fertiliser/crop-season')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  By Crop and Season
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/fertiliser/custom-blend')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  Request a Custom Blend
                </button>
              </li>
            </ul>

            <h3 className="mt-7 text-xs font-semibold text-white">Contact Us</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact/team')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  Talk to Our Team
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact/fpo-partnership')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  FPO Partnership Enquiry
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact/field-support')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  Field Support
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('/contact/callback')}
                  className="cursor-pointer text-stone-400 transition-colors hover:text-white"
                >
                  Request a Callback
                </button>
              </li>
            </ul>
          </div>

          {/* Language Toggle Placeholder */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold text-white">Language</h3>
            <div
              role="group"
              aria-label="Language selection"
              className="mt-4 inline-flex flex-col gap-1.5 rounded-lg border border-stone-800 bg-[#1B1B19] p-1.5"
            >
              {(['English', 'Marathi', 'Hindi'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`min-h-[36px] cursor-pointer rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                    language === lang
                      ? 'bg-white text-[#141413]'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs text-stone-500">
              Voice alerts are delivered in {language}.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-stone-800 pt-8 text-xs text-stone-400 sm:flex-row sm:items-center">
          <p>Planning prices. Final pricing confirmed at enrolment.</p>
          <p>© {new Date().getFullYear()} Tribulum Agritech. Sold through partner FPOs.</p>
        </div>
      </div>
    </footer>
  );
}
