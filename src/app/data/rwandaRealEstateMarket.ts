export interface RwandaRealEstateCompany {
  name: string;
  focus: string;
  areas: string[];
  website: string;
  note: string;
}

export const RWANDA_REAL_ESTATE_COMPANIES: RwandaRealEstateCompany[] = [
  {
    name: 'Kigali Real Estate',
    focus: 'buy, rent, luxury apartments, villas, investment support',
    areas: ['Kimihurura', 'Kigali', 'Gishushu'],
    website: 'https://kigaliestate.com/',
    note: 'Long-running Kigali-focused agency with rentals, sales, and investment-oriented listings.',
  },
  {
    name: 'Imara Properties Rwanda',
    focus: 'premium development, luxury apartments, villas, investment',
    areas: ['Kimihurura', 'Kacyiru', 'Rebero', 'Kibagabaga'],
    website: 'https://www.imara-properties.com/',
    note: 'Developer-oriented brand with premium and luxury residential projects in Kigali.',
  },
  {
    name: 'Terra Real Estate',
    focus: 'platform listings, agents, consultants, buy, sell, rent',
    areas: ['Kigali', 'nationwide'],
    website: 'https://www.terra.rw/',
    note: 'Broad marketplace model connecting buyers, sellers, agents, and consultants across districts.',
  },
  {
    name: 'Vibe Real Estate',
    focus: 'agency services, investment opportunities, houses, apartments, land',
    areas: ['Kigali'],
    website: 'https://vibe.rw/agency/',
    note: 'Agency brand centered on helping users find and invest in Kigali property.',
  },
  {
    name: 'Premier Real Estate Services',
    focus: 'residential and commercial rentals and sales',
    areas: ['Kiyovu', 'Nyarutarama', 'Kacyiru', 'Kigali'],
    website: 'https://premierrealestate.co.rw/',
    note: 'Boutique Kigali firm covering both residential and commercial categories.',
  },
  {
    name: 'Kenabu Holdings',
    focus: 'property management, rentals, sales, investment consultancy',
    areas: ['Remera', 'Kigali'],
    website: 'https://www.kenabu.co/',
    note: 'Management and consultancy-oriented company with institutional clients listed on site.',
  },
];

export function buildRwandaRealEstateContext() {
  const companies = RWANDA_REAL_ESTATE_COMPANIES.map((company) => (
    `- ${company.name}: focus ${company.focus}; areas ${company.areas.join(', ')}; website ${company.website}; note ${company.note}`
  )).join('\n');

  return [
    'Use the following Rwanda real-estate market context in a grounded, non-fabricated way.',
    'Treat it as a directory and market guide, not proof of current live inventory or exact prices.',
    'If the user asks for companies, agencies, or where to search, prefer these names before inventing examples.',
    'If the user asks for live listing availability, say availability may change and suggest verifying directly with the company website or contact team.',
    'Current curated company context:',
    companies,
  ].join('\n');
}
