export const intents = {
  explore: "Just exploring",
  compare: "Planning a campaign",
  ready: "Ready to mail",
};
export const types = {
  privateduty: "Private duty",
  homehealth: "Home health",
  hospice: "Hospice",
  startup: "Starting an agency",
};
export const states = {
  NJ: "New Jersey",
  NY: "New York",
  CT: "Connecticut",
  MA: "Massachusetts",
  NH: "New Hampshire",
  ME: "Maine",
  NC: "North Carolina",
  FL: "Florida",
  MS: "Mississippi",
  TX: "Texas",
  AZ: "Arizona",
  CA: "California",
  CO: "Colorado",
  UT: "Utah",
  IL: "Illinois",
  DE: "Delaware",
  RI: "Rhode Island",
  SC: "South Carolina",
  VA: "Virginia",
  WV: "West Virginia",
  OH: "Ohio",
};
export const layers = [
  [
    "55+ and active adult communities",
    "We map the age-restricted and active adult communities in your service area and mail the households on the carrier routes that cover them.",
    "55+ communities",
  ],
  [
    "Senior-dense ZIP codes and routes",
    "Census data shows the share of residents 65 and older by ZIP code and neighborhood. We start where that share runs highest.",
    "senior-dense routes",
  ],
  [
    "Ability to pay",
    "For private-pay care, we layer household income and home value to reach families who can afford ongoing hours.",
    "household income and home value",
  ],
  [
    "Long-time homeowners",
    "People who have owned the same home for years are often determined to stay in it. That is exactly who home care keeps at home.",
    "long-time homeowners",
  ],
  [
    "Adult children nearby",
    "Reach Gen X and younger Boomer homeowners with a message written for the son or daughter arranging care.",
    "adult children nearby",
  ],
  [
    "Your real service radius",
    "We draw the map around your office and the drive times your caregivers will actually make.",
    "caregiver drive times",
  ],
  [
    "Smart exclusions",
    "Remove current clients, households outside your licensed territory and, when you want a fresh list, homes you mailed last round.",
    "client and territory exclusions",
  ],
];
export const audiences = [
  {
    id: "adultkids",
    name: "Adult children, 45 to 75",
    desc: "Gen X and younger Boomers who own homes in ZIP codes with a high share of residents 65 and older. They make or steer the decision.",
    tag: "For families caring for a parent",
    title:
      "Worried about Mom living alone? You don’t have to figure this out by yourself.",
    body: "Talk to a local care coordinator tonight. No pressure, just a plan that keeps her home and safe.",
    why: "This is the person up at 11pm searching for answers. The card speaks to the guilt and the worry, then gives them one easy next step.",
  },
  {
    id: "seniors",
    name: "Homeowners 65 and older",
    desc: "Targeted list by age and homeownership. Large type, plain language, one phone number.",
    tag: "For homeowners",
    title: "A little help can make staying home easier.",
    body: "Talk with our local team about support that fits your routine.",
    why: "A simple message gives the reader control over the next step.",
  },
  {
    id: "communities",
    name: "55+ and active adult communities",
    desc: "Carrier routes that cover age-restricted and active adult communities, mailed saturation style.",
    tag: "Care in your community",
    title: "There’s help close to home.",
    body: "Ask about everyday support in your neighborhood, on your schedule.",
    why: "A neighborhood message makes the service feel close and familiar.",
  },
  {
    id: "referral",
    name: "Referral sources",
    desc: "Discharge planners, physician offices, senior centers, elder law attorneys and assisted living staff.",
    tag: "For referral partners",
    title: "A local point of contact for your next referral.",
    body: "Contact our intake team. We respond within [YOUR TIMEFRAME].",
    why: "A clear intake contact and an agency-confirmed response time help partners plan.",
  },
  {
    id: "recruit",
    name: "Caregiver recruiting",
    desc: "Households within a short drive of your office, plus nursing and CNA program areas.",
    tag: "For local caregivers",
    title: "Care for people in your own community.",
    body: "Get in touch with our team about caregiving opportunities close to home.",
    why: "Location and a clear invitation help prospective caregivers take the first step.",
  },
];
export const steps = [
  [
    "Card lands",
    "Three drops to the same households. Custom QR code to your page.",
  ],
  [
    "Family looks you up",
    "They search Google or ask ChatGPT. Your site and reviews answer.",
  ],
  [
    "Ads remind them",
    "Optional Meta or ChatGPT ads reach the same neighborhoods that week.",
  ],
  [
    "Client starts care",
    "You log the inquiry in your own CRM and tell us what worked.",
  ],
  ["Thank-you card", "A thank-you and review-request card goes to the family."],
  [
    "Reviews feed the next drop",
    "Fresh reviews and referrals help the next family find you.",
  ],
];
export const faqs = [
  [
    "Does direct mail still work for home care agencies?",
    "A postcard can reach both the person receiving care and the family member arranging it. Plan repeated drops and track inquiries in your CRM to learn what works in your service area.",
  ],
  [
    "Who should a home care postcard be sent to?",
    "Start with adult children arranging care, homeowners aged 65 and older, or local 55+ communities. Referral partners and caregiver recruits need their own message.",
  ],
  [
    "Can you target 55+ communities with direct mail?",
    "Yes. PrintFast can map active adult communities and mail the carrier routes that cover them. Route boundaries may extend beyond a community.",
  ],
  [
    "Can a Medicare home health or hospice agency offer a gift in a mailer?",
    "Have your compliance officer or healthcare attorney review the specific offer before printing. An education-first mailer can introduce your services without a gift or discount.",
  ],
  [
    "Do you provide call tracking or reporting?",
    "Each card gets a custom QR code to your chosen page. Your team logs inquiries in its own CRM. PrintFast does not provide call tracking or attribution dashboards.",
  ],
  [
    "How do ChatGPT and Meta ads work with my postcards?",
    "Optional ad campaigns can run in the same neighborhoods around your mail drop. Choose Meta, ChatGPT or both. Ad management and ad spend are separate from mailing costs.",
  ],
  [
    "Where does PrintFast mail?",
    "PrintFast serves agencies in the continental United States from Lakewood, New Jersey. Your plan can focus on ZIP codes, towns or communities within your service area.",
  ],
].map(([question, answer]) => ({ question, answer }));
