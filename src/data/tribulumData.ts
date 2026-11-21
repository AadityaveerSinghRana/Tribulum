export type TierSlug = 'watch' | 'scout' | 'care' | 'full-care';
export type FertiliserMode = 'soil-test' | 'crop-season' | 'custom-blend';
export type ContactMode = 'team' | 'fpo-partnership' | 'field-support' | 'callback';

export interface MembershipTier {
  slug: TierSlug;
  route: string;
  name: string;
  pricePerAcre: number;
  priceDisplay: string;
  scansPerYear: string;
  scansLabel: string;
  popular?: boolean;
  shortSummary: string;
  heroSubheadline: string;
  includes: string[];
  whoItIsFor: string[];
  faqs: { question: string; answer: string }[];
}

export const MEDIA_ASSETS = {
  heroKonkanFields: '/src/assets/images/hero_konkan_fields_1795257453405.jpg',
  heroFarmerCoordinator: '/src/assets/images/hero_farmer_coordinator_1795257453861.jpg',
  aerialPlotMosaic: '/src/assets/images/aerial_plot_mosaic_1795257453364.jpg',
  nirGrainTesting: '/src/assets/images/nir_grain_testing_1795257453700.jpg',
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Scan',
    headline: 'Scheduled satellite triage and drone verification',
    description:
      'Every enrolled plot is monitored across Kharif and Rabi. When satellite imagery flags moisture stress, canopy dip, or pest pressure, a targeted drone sortie inspects the affected boundary.',
  },
  {
    number: '02',
    title: 'Alert',
    headline: 'Direct voice alerts in Marathi, Hindi, or English',
    description:
      'Instead of complex dashboards, farmers receive a clear voice note and FPO field coordinators receive plot-level coordinates identifying which part of the field needs attention.',
  },
  {
    number: '03',
    title: 'Action',
    headline: 'Targeted response with transparent partner rates',
    description:
      'Route an FPO field visit, spot spray, or nutrient adjustment before crop loss spreads. Sprays remain a pass-through at the partner rate and are never bundled into your membership.',
  },
  {
    number: '04',
    title: 'Record',
    headline: 'Season-long plot evidence for FPOs and credit',
    description:
      'Every scan, alert, field check, and NIR test builds a timestamped plot record across both seasons—supporting crop quality grading, input planning, and FPO compliance.',
  },
] as const;

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    slug: 'watch',
    route: '/membership/watch',
    name: 'Watch',
    pricePerAcre: 170,
    priceDisplay: '₹170',
    scansPerYear: '4',
    scansLabel: '4 scans/yr',
    shortSummary:
      'Satellite triage, drone check on flagged plots, voice alert, record.',
    heroSubheadline:
      'Essential two-season satellite watch with triggered drone verification when stress appears.',
    includes: [
      '4 scheduled satellite triage scans per acre across Kharif & Rabi',
      'Triggered drone inspection on plots flagged for canopy or moisture anomalies',
      'Local-language voice alert sent directly to the enrolled farmer phone',
      'Timestamped season evidence record shared with your FPO',
    ],
    whoItIsFor: [
      'Rainfed paddy, millet, and pulse growers seeking affordable early warning',
      'First-time FPO members starting with low-overhead acreage coverage',
      'Farms with stable perennial crops needing seasonal checkpoint verification',
    ],
    faqs: [
      {
        question: 'Does Watch cover both Kharif and Rabi seasons?',
        answer:
          'Yes. All Tribulum memberships cover one full agricultural year (two seasons) per enrolled acre.',
      },
      {
        question: 'When is a drone sent under the Watch tier?',
        answer:
          'Whenever one of the 4 satellite triage passes flags an unusual drop in crop vigour or moisture stress on your plot, a targeted drone check is scheduled through your FPO zone.',
      },
      {
        question: 'Are drone sprays included in ₹170/acre/yr?',
        answer:
          'No. Sprays are always a pass-through at the local spray partner rate and are never bundled into monitoring memberships.',
      },
    ],
  },
  {
    slug: 'scout',
    route: '/membership/scout',
    name: 'Scout',
    pricePerAcre: 340,
    priceDisplay: '₹340',
    scansPerYear: '8',
    scansLabel: '8 scans/yr',
    shortSummary: 'Regular scans and alerts across key crop growth stages.',
    heroSubheadline:
      'Regular eight-pass monitoring timed to tillering, flowering, and grain-fill stages.',
    includes: [
      '8 regular crop-health scans per year across two seasons',
      'Targeted drone checks on flagged plots with zone-level imagery',
      'Stage-linked voice alerts in Marathi, Hindi, or English',
      'Complete two-season crop observation log via your FPO',
    ],
    whoItIsFor: [
      'Irrigated paddy, sugarcane, vegetable, and cotton farmers tracking mid-season vigour',
      'FPO clusters wanting reliable milestone coverage without fortnightly cadence',
      'Growers planning top-dressing or pest scouting around vegetative and flowering peaks',
    ],
    faqs: [
      {
        question: 'How is Scout different from Watch?',
        answer:
          'Scout doubles the scan frequency to 8 passes per year, aligning observations closely with critical fertiliser top-dressing and flowering stages.',
      },
      {
        question: 'Can I enrol through my local FPO?',
        answer:
          'Yes. Individual farmers enrol through an active FPO or join together under a Village Gaon pack.',
      },
      {
        question: 'What happens after an alert is triggered?',
        answer:
          'You receive a concise voice alert describing the flagged zone, and your FPO coordinator gets the plot map to coordinate inspection or optional partner spraying.',
      },
    ],
  },
  {
    slug: 'care',
    route: '/membership/care',
    name: 'Care',
    pricePerAcre: 850,
    priceDisplay: '₹850',
    scansPerYear: '20',
    scansLabel: '20 scans/yr',
    popular: true,
    shortSummary:
      'Twice-monthly scans, alert-to-action routing, evidence record.',
    heroSubheadline:
      'Twice-monthly monitoring with direct alert-to-action routing through your FPO.',
    includes: [
      '20 twice-monthly crop scans per year covering both cropping seasons',
      'Alert-to-action routing directly to FPO field coordinators and spray partners',
      'Priority drone verification on flagged orchard and field zones',
      'Full season-long evidence record for crop health and intervention history',
    ],
    whoItIsFor: [
      'Alphonso mango, cashew, vegetable, and high-value horticulture growers',
      'FPOs coordinating active pest, blight, and irrigation management across clusters',
      'Farmers who want continuous twice-monthly visibility and rapid field routing',
    ],
    faqs: [
      {
        question: 'Why is Care the most popular membership?',
        answer:
          'Twice-monthly scans (20/yr) catch early fungal, nutrient, or moisture stress within days rather than weeks, and alert-to-action routing ensures an FPO field person follows through.',
      },
      {
        question: 'Are cluster discounts available for Care?',
        answer:
          'Yes. FPOs enrolling 375+ acres across 2+ zones qualify for Cluster pricing (₹800/acre), and 600+ acres across all three farming spokes qualify for Full Konkan pricing (₹780/acre).',
      },
      {
        question: 'Does Care include chemical sprays?',
        answer:
          'No. Monitoring and routing are included; if a spray is needed, it is billed transparently as a pass-through at the partner rate.',
      },
    ],
  },
  {
    slug: 'full-care',
    route: '/membership/full-care',
    name: 'Full-Care',
    pricePerAcre: 1050,
    priceDisplay: '₹1,050',
    scansPerYear: '20 + 8 tests',
    scansLabel: '20 scans + 8 NIR tests/yr',
    shortSummary:
      'Care plus 8 NIR grain/produce tests per member per year.',
    heroSubheadline:
      'Complete field-to-harvest intelligence combining 20 scans with 8 portable NIR produce tests.',
    includes: [
      'Everything in Care: 20 twice-monthly scans, drone verification, and alert-to-action routing',
      '8 portable Near-Infrared (NIR) grain and produce quality tests per member per year',
      'Moisture, protein/Brix, and nutrient-uptake indicators logged at harvest',
      'NIR-informed baseline carried into next-season custom fertiliser requests',
    ],
    whoItIsFor: [
      'Commercial FPOs aggregating graded grain, pulses, or export-grade orchards',
      'Farmers seeking verifiable quality data at mandi or FPO procurement time',
      'Growers customising fertiliser blends based on real crop uptake rather than guesswork',
    ],
    faqs: [
      {
        question: 'What do the 8 NIR grain/produce tests measure?',
        answer:
          'Portable NIR scans give rapid non-destructive readings such as grain moisture, protein, oil, or fruit Brix/dry-matter at harvest and storage checkpoints.',
      },
      {
        question: 'How do NIR tests improve fertiliser planning?',
        answer:
          'Harvest produce composition reveals what nutrients your crop actually absorbed versus what stayed unused in soil, sharpening next-season NPK blend requests.',
      },
      {
        question: 'Are the 8 tests per acre or per member?',
        answer:
          'Full-Care includes 8 NIR grain/produce tests per enrolled member per year alongside the ₹1,050/acre/yr monitoring coverage.',
      },
    ],
  },
];

export const FPO_PRICING_TIERS = [
  {
    id: 'solo_fpo' as const,
    name: 'Solo FPO',
    criteria: 'Single zone, under 375 acres',
    pricePerAcre: 850,
    priceDisplay: '₹850',
    description:
      'Ideal for an individual FPO launching Care monitoring across a single taluka or procurement zone.',
  },
  {
    id: 'cluster' as const,
    name: 'Cluster',
    criteria: '375+ acres across 2+ zones',
    pricePerAcre: 800,
    priceDisplay: '₹800',
    description:
      'Shared drone sortie scheduling and coordinated field routing across neighbouring FPO zones.',
  },
  {
    id: 'full_konkan' as const,
    name: 'Full Konkan',
    criteria: '600+ acres across all three farming spokes',
    pricePerAcre: 780,
    priceDisplay: '₹780',
    description:
      'Lowest Care per-acre rate for multi-spoke Konkan federation deployments with dedicated spoke coverage.',
  },
];

export const VILLAGE_PACKS = [
  {
    id: 'gaon_50' as const,
    name: 'Gaon-50',
    acresTarget: 50,
    pricePerAcre: 820,
    priceDisplay: '₹820',
    description:
      'Entry collective pack for 50+ contiguous village acres with one trained Gaon operator.',
  },
  {
    id: 'gaon_100' as const,
    name: 'Gaon-100',
    acresTarget: 100,
    pricePerAcre: 780,
    priceDisplay: '₹780',
    popular: true,
    description:
      'Standard village-unit pack for 100+ acres, cutting coordination overhead and training a local youth operator.',
  },
  {
    id: 'gaon_200' as const,
    name: 'Gaon-200',
    acresTarget: 200,
    pricePerAcre: 740,
    priceDisplay: '₹740',
    description:
      'Whole-panchayat scale pack for 200+ acres with full Care cadence and village-level seasonal review.',
  },
];

export const FERTILISER_TOPICS: Record<
  FertiliserMode,
  {
    route: string;
    title: string;
    eyebrow: string;
    subtitle: string;
    highlightNote: string;
  }
> = {
  'soil-test': {
    route: '/fertiliser/soil-test',
    title: 'Customise Fertiliser by Soil Test',
    eyebrow: 'Soil-Lab Driven Blend Request',
    subtitle:
      'Enter your Soil Health Card or lab values (N, P, K, pH) alongside crop and acreage so our agronomy desk prepares a tailored nutrient schedule.',
    highlightNote:
      'Provide available Nitrogen, Phosphorus, Potassium, and pH readings below. Leave any unknown field blank and our team will follow up.',
  },
  'crop-season': {
    route: '/fertiliser/crop-season',
    title: 'Customise Fertiliser by Crop and Season',
    eyebrow: 'Stage-Matched Nutrition Request',
    subtitle:
      'Tell us what you are sowing in Kharif, Rabi, or Zaid along with your soil type and acreage to request a basal and top-dressing plan.',
    highlightNote:
      'Optional soil test numbers can still be added if you have a recent Soil Health Card.',
  },
  'custom-blend': {
    route: '/fertiliser/custom-blend',
    title: 'Request a Custom Fertiliser Blend',
    eyebrow: 'Orchard & FPO Bulk Blend Request',
    subtitle:
      'Designed for mango orchards, multi-crop plots, and FPOs procuring a unified micronutrient and NPK blend across member farms.',
    highlightNote:
      'Submit your plot parameters below. Our agronomy team reviews every submission and responds directly with a verified recommendation.',
  },
};

export const CONTACT_TOPICS: Record<
  ContactMode,
  {
    route: string;
    typeValue?: 'team' | 'fpo_partnership' | 'field_support';
    title: string;
    eyebrow: string;
    subtitle: string;
    placeholderMessage: string;
  }
> = {
  team: {
    route: '/contact/team',
    typeValue: 'team',
    title: 'Talk to Our Team',
    eyebrow: 'General & Membership Enquiries',
    subtitle:
      'Questions on Watch, Scout, Care, or Full-Care coverage for your farm? Send us a note with your village or FPO name.',
    placeholderMessage:
      'Share your crop, acreage, or questions about Tribulum monitoring plans...',
  },
  'fpo-partnership': {
    route: '/contact/fpo-partnership',
    typeValue: 'fpo_partnership',
    title: 'FPO Partnership Enquiry',
    eyebrow: 'FPO & Federation Onboarding',
    subtitle:
      'Partner with Tribulum to offer per-acre crop monitoring, local operator training, and NIR grain testing to your FPO members.',
    placeholderMessage:
      'Tell us about your FPO zones, approximate member count, and primary crops...',
  },
  'field-support': {
    route: '/contact/field-support',
    typeValue: 'field_support',
    title: 'Field Support',
    eyebrow: 'Active Member & Operator Desk',
    subtitle:
      'Need help with a flagged plot alert, drone visit scheduling, voice alert language, or NIR testing kit support?',
    placeholderMessage:
      'Describe the plot ID, alert date, or field issue so our local coordinator can assist...',
  },
  callback: {
    route: '/contact/callback',
    title: 'Request a Callback',
    eyebrow: 'Scheduled Phone Consultation',
    subtitle:
      'Prefer to speak over the phone in Marathi, Hindi, or English? Pick a convenient time slot and a Tribulum advisor will call you.',
    placeholderMessage: '',
  },
};

export const CALLBACK_SLOTS = [
  'Morning (8:00 AM – 11:00 AM)',
  'Midday (11:00 AM – 3:00 PM)',
  'Afternoon (3:00 PM – 6:00 PM)',
  'Evening (6:00 PM – 8:00 PM)',
] as const;

export const KONKAN_BELTS = [
  'Ratnagiri Mango Belt',
  'Sindhudurg Paddy',
  'Raigad Coastal',
  'Palghar Horticulture',
  'Satara Pulse Cluster',
  'Nashik Growers',
] as const;

export const TIER_DEMO_PRESETS: Record<
  TierSlug,
  {
    name: string;
    phone: string;
    village: string;
    fpoName: string;
    acres: string;
  }
> = {
  watch: {
    name: 'Prakash Rane',
    phone: '9820111401',
    village: 'Kankavli',
    fpoName: 'Kankavli Krishi Vikas FPC',
    acres: '4',
  },
  scout: {
    name: 'Sunita Patil',
    phone: '9820222402',
    village: 'Chiplun',
    fpoName: 'Sahyadri Paddy & Pulse FPO',
    acres: '6.5',
  },
  care: {
    name: 'Rajesh Sawant',
    phone: '9820333403',
    village: 'Lanja',
    fpoName: 'Ratnagiri Mango Agro FPC',
    acres: '12',
  },
  'full-care': {
    name: 'Anant Desai',
    phone: '9820444404',
    village: 'Devgad',
    fpoName: 'Devgad Konkan Export FPO',
    acres: '18',
  },
};

export const FPO_DEMO_PRESETS: Record<
  'solo_fpo' | 'cluster' | 'full_konkan',
  {
    fpoName: string;
    contactName: string;
    phone: string;
    village: string;
    district: string;
    memberCount: string;
    totalAcres: string;
  }
> = {
  solo_fpo: {
    fpoName: 'Sawantwadi Farmers Producer Co.',
    contactName: 'Mahesh Deshmukh',
    phone: '9820555101',
    village: 'Sawantwadi',
    district: 'Sindhudurg',
    memberCount: '110',
    totalAcres: '260',
  },
  cluster: {
    fpoName: 'Konkan Cluster Agro Federation',
    contactName: 'Kavita Joshi',
    phone: '9820555202',
    village: 'Rajapur',
    district: 'Ratnagiri',
    memberCount: '185',
    totalAcres: '420',
  },
  full_konkan: {
    fpoName: 'Paschim Konkan Three-Spoke FPO',
    contactName: 'Dinesh Kulkarni',
    phone: '9820555303',
    village: 'Alibag',
    district: 'Raigad',
    memberCount: '310',
    totalAcres: '680',
  },
};

export const VILLAGE_DEMO_PRESETS: Record<
  'gaon_50' | 'gaon_100' | 'gaon_200',
  {
    village: string;
    contactName: string;
    phone: string;
    fpoName: string;
    district: string;
  }
> = {
  gaon_50: {
    village: 'Pawas Gram Panchayat',
    contactName: 'Sandeep Shirke',
    phone: '9820666050',
    fpoName: 'Pawas Krishi Vikas FPO',
    district: 'Ratnagiri',
  },
  gaon_100: {
    village: 'Vengurla Gram Sabha',
    contactName: 'Sunita Kulkarni',
    phone: '9820666100',
    fpoName: 'Sindhudurg Coastal FPC',
    district: 'Sindhudurg',
  },
  gaon_200: {
    village: 'Dapoli Maha-Gaon Unit',
    contactName: 'Vikram Gokhale',
    phone: '9820666200',
    fpoName: 'Dapoli Horticulture Agro FPO',
    district: 'Ratnagiri',
  },
};
