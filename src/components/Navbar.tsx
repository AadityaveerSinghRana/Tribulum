import { ChevronDown, Menu, UserRound, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CONTACT_TOPICS,
  FERTILISER_TOPICS,
  MEMBERSHIP_TIERS,
} from '../data/tribulumData';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

type DropdownKey = 'membership' | 'fertiliser' | 'contact' | null;

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const { user, profile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<DropdownKey>('membership');
  const closeTimerRef = useRef<number | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const isHome = currentPath === '/';
  const isSolidSurface = !isHome || scrolled || openDropdown !== null || mobileOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const cancelCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleOpen = (key: DropdownKey) => {
    cancelCloseTimer();
    setOpenDropdown(key);
  };

  const handleDelayedClose = () => {
    cancelCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenDropdown(null);
    }, 140);
  };

  const go = (path: string) => {
    setOpenDropdown(null);
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header
      ref={navRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        isSolidSurface
          ? 'border-b border-zinc-800 bg-black/92 text-white backdrop-blur-md'
          : 'border-b border-white/10 bg-transparent text-white'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => go('/')}
          className="cursor-pointer whitespace-nowrap shrink-0 text-left font-serif text-xl font-medium tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Tribulum
        </button>

        {/* Zone 2: Three dropdown menus (Desktop) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {/* Membership Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleOpen('membership')}
            onMouseLeave={handleDelayedClose}
          >
            <button
              type="button"
              aria-expanded={openDropdown === 'membership'}
              onClick={() =>
                setOpenDropdown(openDropdown === 'membership' ? null : 'membership')
              }
              className="flex min-h-[40px] cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 text-sm font-medium text-zinc-200 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Membership</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  openDropdown === 'membership' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === 'membership' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full mt-2 w-80 rounded-xl border border-zinc-800 bg-[#0B0B0C] p-2 text-zinc-100 shadow-2xl"
                >
                  <div className="px-3 py-1.5 text-xs font-medium text-zinc-400">
                    Per-acre annual plans (2 seasons)
                  </div>
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <button
                      key={tier.slug}
                      type="button"
                      onClick={() => go(tier.route)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {tier.name}
                        </span>
                        {tier.popular && (
                          <span className="text-xs font-medium text-emerald-400">
                            · Most popular
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-zinc-400 tabular-nums">
                        {tier.priceDisplay}/acre/yr
                      </span>
                    </button>
                  ))}
                  <div className="my-1.5 h-px bg-zinc-800" />
                  <button
                    type="button"
                    onClick={() => go('/membership/village')}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      Village Membership (Gaon packs)
                    </span>
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">
                      From ₹740
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/membership/fpo')}
                    className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      FPO Membership
                    </span>
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">
                      From ₹780
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Customise Fertiliser Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleOpen('fertiliser')}
            onMouseLeave={handleDelayedClose}
          >
            <button
              type="button"
              aria-expanded={openDropdown === 'fertiliser'}
              onClick={() =>
                setOpenDropdown(openDropdown === 'fertiliser' ? null : 'fertiliser')
              }
              className="flex min-h-[40px] cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 text-sm font-medium text-zinc-200 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Customise Fertiliser</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  openDropdown === 'fertiliser' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === 'fertiliser' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-zinc-800 bg-[#0B0B0C] p-2 text-zinc-100 shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => go(FERTILISER_TOPICS['soil-test'].route)}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      By Soil Test
                    </span>
                    <span className="text-xs text-zinc-400">
                      Submit N, P, K and pH readings
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(FERTILISER_TOPICS['crop-season'].route)}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      By Crop and Season
                    </span>
                    <span className="text-xs text-zinc-400">
                      Kharif, Rabi, or Zaid stage schedules
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(FERTILISER_TOPICS['custom-blend'].route)}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      Request a Custom Blend
                    </span>
                    <span className="text-xs text-zinc-400">
                      Tailored orchard or FPO procurement mix
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Us Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleOpen('contact')}
            onMouseLeave={handleDelayedClose}
          >
            <button
              type="button"
              aria-expanded={openDropdown === 'contact'}
              onClick={() =>
                setOpenDropdown(openDropdown === 'contact' ? null : 'contact')
              }
              className="flex min-h-[40px] cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 text-sm font-medium text-zinc-200 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <span>Contact Us</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  openDropdown === 'contact' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === 'contact' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-0 top-full mt-2 w-72 rounded-xl border border-zinc-800 bg-[#0B0B0C] p-2 text-zinc-100 shadow-2xl"
                >
                  <button
                    type="button"
                    onClick={() => go(CONTACT_TOPICS.team.route)}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      Talk to Our Team
                    </span>
                    <span className="text-xs text-zinc-400">
                      Membership &amp; plot coverage questions
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(CONTACT_TOPICS['fpo-partnership'].route)}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      FPO Partnership Enquiry
                    </span>
                    <span className="text-xs text-zinc-400">
                      Onboard your FPO or cluster zone
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go(CONTACT_TOPICS['field-support'].route)}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-white">
                      Field Support
                    </span>
                    <span className="text-xs text-zinc-400">
                      Alerts, drone visits, and NIR kits
                    </span>
                  </button>
                  <div className="my-1.5 h-px bg-zinc-800" />
                  <button
                    type="button"
                    onClick={() => go(CONTACT_TOPICS.callback.route)}
                    className="flex w-full cursor-pointer flex-col rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-900"
                  >
                    <span className="text-sm font-medium text-emerald-400">
                      Request a Callback
                    </span>
                    <span className="text-xs text-zinc-400">
                      Pick a preferred time slot for a call
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Zone 3: Sign in / Account + Primary CTA + Mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => go('/auth')}
            className="hidden min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-200 whitespace-nowrap shrink-0 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:inline-flex"
          >
            <UserRound className="h-3.5 w-3.5" />
            <span>
              {user
                ? profile?.full_name?.split(' ')[0] || 'Account'
                : 'Sign in'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => go('/membership/care')}
            className="hidden min-h-[40px] cursor-pointer items-center justify-center rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:inline-flex"
          >
            Enrol Acreage
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-lg text-white transition-colors hover:bg-zinc-900 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-zinc-800 bg-black px-4 pb-6 pt-3 text-zinc-100 md:hidden"
          >
            {/* Mobile Section 1: Membership */}
            <div className="border-b border-zinc-800 py-2">
              <button
                type="button"
                onClick={() =>
                  setMobileSection(mobileSection === 'membership' ? null : 'membership')
                }
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-between text-left text-sm font-semibold text-white"
              >
                <span>Membership</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${
                    mobileSection === 'membership' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileSection === 'membership' && (
                <div className="mt-1 space-y-1 pb-2">
                  {MEMBERSHIP_TIERS.map((tier) => (
                    <button
                      key={tier.slug}
                      type="button"
                      onClick={() => go(tier.route)}
                      className="flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                    >
                      <span>
                        {tier.name}
                        {tier.popular ? (
                          <span className="ml-2 text-xs font-medium text-emerald-400">
                            · Most popular
                          </span>
                        ) : null}
                      </span>
                      <span className="font-mono text-xs text-zinc-400 tabular-nums">
                        {tier.priceDisplay}/acre/yr
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => go('/membership/village')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    <span>Village Membership (Gaon packs)</span>
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">
                      From ₹740
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/membership/fpo')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    <span>FPO Membership</span>
                    <span className="font-mono text-xs text-zinc-400 tabular-nums">
                      From ₹780
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Section 2: Customise Fertiliser */}
            <div className="border-b border-zinc-800 py-2">
              <button
                type="button"
                onClick={() =>
                  setMobileSection(mobileSection === 'fertiliser' ? null : 'fertiliser')
                }
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-between text-left text-sm font-semibold text-white"
              >
                <span>Customise Fertiliser</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${
                    mobileSection === 'fertiliser' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileSection === 'fertiliser' && (
                <div className="mt-1 space-y-1 pb-2">
                  <button
                    type="button"
                    onClick={() => go('/fertiliser/soil-test')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    By Soil Test
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/fertiliser/crop-season')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    By Crop and Season
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/fertiliser/custom-blend')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Request a Custom Blend
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Section 3: Contact Us */}
            <div className="border-b border-zinc-800 py-2">
              <button
                type="button"
                onClick={() =>
                  setMobileSection(mobileSection === 'contact' ? null : 'contact')
                }
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-between text-left text-sm font-semibold text-white"
              >
                <span>Contact Us</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${
                    mobileSection === 'contact' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {mobileSection === 'contact' && (
                <div className="mt-1 space-y-1 pb-2">
                  <button
                    type="button"
                    onClick={() => go('/contact/team')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Talk to Our Team
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/contact/fpo-partnership')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    FPO Partnership Enquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/contact/field-support')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                  >
                    Field Support
                  </button>
                  <button
                    type="button"
                    onClick={() => go('/contact/callback')}
                    className="flex min-h-[44px] w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-emerald-400 hover:bg-zinc-900"
                  >
                    Request a Callback
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => go('/auth')}
                className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                <UserRound className="h-4 w-4" />
                <span>{user ? 'My Account' : 'Sign in'}</span>
              </button>
              <button
                type="button"
                onClick={() => go('/membership/care')}
                className="min-h-[44px] w-full cursor-pointer rounded-lg bg-[#1F6F50] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#185840]"
              >
                Enrol Acreage
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
