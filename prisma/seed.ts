import {
  AgencyPlan,
  AgencyStatus,
  AuthProvider,
  ConfidenceLevel,
  InsightStatus,
  InsightType,
  LocationStatus,
  MembershipRole,
  MembershipStatus,
  PrismaClient,
  RestaurantStatus,
  ReviewSourceConnectionStatus,
  ReviewSourceType,
  Sentiment,
  SourceApprovalStatus,
  UserStatus
} from "@prisma/client";

const prisma = new PrismaClient();

const collectedAt = new Date("2026-06-20T12:00:00.000Z");
const acceptedAt = new Date("2026-06-01T09:00:00.000Z");

type SeedUser = {
  id: string;
  email: string;
  name: string;
};

type SeedMembership = {
  agencySlug: string;
  userEmail: string;
  role: MembershipRole;
  restaurantSlug?: string;
};

type SeedReview = {
  id: string;
  externalId: string;
  rating: string;
  title: string;
  text: string;
  sentiment: Sentiment;
  sentimentScore: string;
  themes: string[];
  publishedAt: Date;
  sourcePayloadHash: string;
};

type SeedLocation = {
  id: string;
  name: string;
  city: string;
  region: string;
  timezone: string;
  sourceId: string;
  externalLocationId: string;
  reviews: SeedReview[];
};

type SeedRestaurant = {
  id: string;
  name: string;
  slug: string;
  segment: string;
  cuisine: string;
  locations: SeedLocation[];
};

type SeedAgency = {
  id: string;
  name: string;
  slug: string;
  plan: AgencyPlan;
  restaurants: SeedRestaurant[];
};

type SeedInsight = {
  id: string;
  agencySlug: string;
  restaurantSlug: string;
  createdByEmail: string;
  type: InsightType;
  title: string;
  summary: string;
  sentiment: Sentiment;
  themes: string[];
  confidence: string;
  confidenceLevel: ConfidenceLevel;
  highImpact: boolean;
  sourceReviewIds: string[];
};

const users: SeedUser[] = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    email: "owner.northstar@example.test",
    name: "Alex Park"
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    email: "analyst.northstar@example.test",
    name: "Priya Shah"
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    email: "manager.juniper@example.test",
    name: "Mateo Cruz"
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    email: "viewer.juniper@example.test",
    name: "Riley Chen"
  }
];

const agencies: SeedAgency[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    name: "Northstar Demo Agency",
    slug: "northstar-demo-agency",
    plan: AgencyPlan.PROFESSIONAL,
    restaurants: [
      {
        id: "00000000-0000-4000-8000-000000000301",
        name: "Fictional Elm & Ember Kitchen",
        slug: "fictional-elm-ember-kitchen",
        segment: "Casual dining",
        cuisine: "Seasonal comfort",
        locations: [
          {
            id: "00000000-0000-4000-8000-000000000401",
            name: "Demo Midtown Counter",
            city: "Demo City",
            region: "FD",
            timezone: "America/New_York",
            sourceId: "00000000-0000-4000-8000-000000000501",
            externalLocationId: "fictional-elm-ember-midtown",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000601",
                externalId: "fictional-review-elm-midtown-001",
                rating: "4.60",
                title: "Fictional review: steady weekday lunch",
                text: "Fictional public review for seed data: The weekday lunch service felt organized, the dining room was calm, and the roasted vegetable plate arrived warm.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.8200",
                themes: ["service", "lunch", "food temperature"],
                publishedAt: new Date("2026-05-12T17:30:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-elm-midtown-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000602",
                externalId: "fictional-review-elm-midtown-002",
                rating: "3.20",
                title: "Fictional review: pickup timing note",
                text: "Fictional public review for seed data: Pickup took longer than the quoted time, but the staff explained the delay and packed the order carefully.",
                sentiment: Sentiment.MIXED,
                sentimentScore: "0.1800",
                themes: ["pickup", "wait time", "communication"],
                publishedAt: new Date("2026-05-18T18:45:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-elm-midtown-002"
              }
            ]
          },
          {
            id: "00000000-0000-4000-8000-000000000402",
            name: "Sample Riverside Room",
            city: "Sampleton",
            region: "FD",
            timezone: "America/New_York",
            sourceId: "00000000-0000-4000-8000-000000000502",
            externalLocationId: "fictional-elm-ember-riverside",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000603",
                externalId: "fictional-review-elm-riverside-001",
                rating: "4.80",
                title: "Fictional review: clear service handoff",
                text: "Fictional public review for seed data: The host confirmed the reservation quickly, the server knew the menu well, and dessert arrived with no delay.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.8800",
                themes: ["service", "reservations", "dessert"],
                publishedAt: new Date("2026-05-22T20:10:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-elm-riverside-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000604",
                externalId: "fictional-review-elm-riverside-002",
                rating: "2.70",
                title: "Fictional review: noise concern",
                text: "Fictional public review for seed data: The meal tasted fresh, but the room became loud enough that our table had trouble hearing the server.",
                sentiment: Sentiment.MIXED,
                sentimentScore: "0.0500",
                themes: ["noise", "dining room", "food quality"],
                publishedAt: new Date("2026-06-02T19:20:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-elm-riverside-002"
              }
            ]
          }
        ]
      },
      {
        id: "00000000-0000-4000-8000-000000000302",
        name: "Fictional Birch & Ladle Cafe",
        slug: "fictional-birch-ladle-cafe",
        segment: "Cafe",
        cuisine: "Breakfast and light lunch",
        locations: [
          {
            id: "00000000-0000-4000-8000-000000000403",
            name: "Demo West End",
            city: "Demo City",
            region: "FD",
            timezone: "America/Chicago",
            sourceId: "00000000-0000-4000-8000-000000000503",
            externalLocationId: "fictional-birch-ladle-west-end",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000605",
                externalId: "fictional-review-birch-west-001",
                rating: "4.40",
                title: "Fictional review: breakfast quality",
                text: "Fictional public review for seed data: The breakfast bowl was well seasoned, the counter team kept the line moving, and the coffee was consistent.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.7600",
                themes: ["breakfast", "queue", "coffee"],
                publishedAt: new Date("2026-05-09T14:15:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-birch-west-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000606",
                externalId: "fictional-review-birch-west-002",
                rating: "2.90",
                title: "Fictional review: item unavailable",
                text: "Fictional public review for seed data: The posted special was unavailable by noon, and the replacement suggestion did not match what we came in to order.",
                sentiment: Sentiment.NEGATIVE,
                sentimentScore: "-0.4200",
                themes: ["menu availability", "specials", "expectations"],
                publishedAt: new Date("2026-05-27T16:05:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-birch-west-002"
              }
            ]
          },
          {
            id: "00000000-0000-4000-8000-000000000404",
            name: "Sample Garden Room",
            city: "Sampleton",
            region: "FD",
            timezone: "America/Chicago",
            sourceId: "00000000-0000-4000-8000-000000000504",
            externalLocationId: "fictional-birch-ladle-garden",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000607",
                externalId: "fictional-review-birch-garden-001",
                rating: "4.70",
                title: "Fictional review: calm morning visit",
                text: "Fictional public review for seed data: The morning visit felt relaxed, staff checked on the table at the right pace, and the pastry case was well stocked.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.8400",
                themes: ["morning", "service pace", "pastry"],
                publishedAt: new Date("2026-06-03T13:40:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-birch-garden-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000608",
                externalId: "fictional-review-birch-garden-002",
                rating: "3.50",
                title: "Fictional review: seating wait",
                text: "Fictional public review for seed data: The food was pleasant, but the seating quote changed twice and no one updated the waiting group for several minutes.",
                sentiment: Sentiment.MIXED,
                sentimentScore: "0.1200",
                themes: ["seating", "wait time", "communication"],
                publishedAt: new Date("2026-06-09T15:25:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-birch-garden-002"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    name: "Juniper Demo Agency",
    slug: "juniper-demo-agency",
    plan: AgencyPlan.STARTER,
    restaurants: [
      {
        id: "00000000-0000-4000-8000-000000000303",
        name: "Fictional Cedar Table",
        slug: "fictional-cedar-table",
        segment: "Neighborhood dining",
        cuisine: "Grill and vegetables",
        locations: [
          {
            id: "00000000-0000-4000-8000-000000000405",
            name: "Demo Central Hall",
            city: "Fictional Falls",
            region: "FD",
            timezone: "America/Denver",
            sourceId: "00000000-0000-4000-8000-000000000505",
            externalLocationId: "fictional-cedar-central",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000609",
                externalId: "fictional-review-cedar-central-001",
                rating: "4.50",
                title: "Fictional review: reliable dinner",
                text: "Fictional public review for seed data: Dinner service was steady, the grilled entree matched the menu description, and water refills came without asking.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.7900",
                themes: ["dinner", "menu accuracy", "table service"],
                publishedAt: new Date("2026-05-11T21:05:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-cedar-central-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000610",
                externalId: "fictional-review-cedar-central-002",
                rating: "3.10",
                title: "Fictional review: side dish temperature",
                text: "Fictional public review for seed data: The main plate was prepared well, but the side dish arrived lukewarm and needed to be replaced.",
                sentiment: Sentiment.MIXED,
                sentimentScore: "0.0200",
                themes: ["food temperature", "side dishes", "recovery"],
                publishedAt: new Date("2026-05-29T22:30:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-cedar-central-002"
              }
            ]
          },
          {
            id: "00000000-0000-4000-8000-000000000406",
            name: "Sample North Room",
            city: "Fictional Falls",
            region: "FD",
            timezone: "America/Denver",
            sourceId: "00000000-0000-4000-8000-000000000506",
            externalLocationId: "fictional-cedar-north",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000611",
                externalId: "fictional-review-cedar-north-001",
                rating: "4.20",
                title: "Fictional review: helpful menu guidance",
                text: "Fictional public review for seed data: Staff explained the shareable portions clearly, which helped our group order the right amount of food.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.7000",
                themes: ["menu guidance", "group dining", "service"],
                publishedAt: new Date("2026-06-04T20:45:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-cedar-north-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000612",
                externalId: "fictional-review-cedar-north-002",
                rating: "2.60",
                title: "Fictional review: checkout delay",
                text: "Fictional public review for seed data: The table enjoyed the food, but closing the check took long enough that the visit ended on a flat note.",
                sentiment: Sentiment.MIXED,
                sentimentScore: "-0.0800",
                themes: ["checkout", "visit close", "service timing"],
                publishedAt: new Date("2026-06-12T22:00:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-cedar-north-002"
              }
            ]
          }
        ]
      },
      {
        id: "00000000-0000-4000-8000-000000000304",
        name: "Fictional Slate Spoon Bistro",
        slug: "fictional-slate-spoon-bistro",
        segment: "Bistro",
        cuisine: "Modern plates",
        locations: [
          {
            id: "00000000-0000-4000-8000-000000000407",
            name: "Demo South Patio",
            city: "Practice Port",
            region: "FD",
            timezone: "America/Los_Angeles",
            sourceId: "00000000-0000-4000-8000-000000000507",
            externalLocationId: "fictional-slate-south",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000613",
                externalId: "fictional-review-slate-south-001",
                rating: "4.90",
                title: "Fictional review: patio service",
                text: "Fictional public review for seed data: Patio seating was ready at the booked time, the server paced the courses well, and the vegetables had good texture.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.9100",
                themes: ["patio", "course pacing", "food texture"],
                publishedAt: new Date("2026-05-16T19:55:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-slate-south-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000614",
                externalId: "fictional-review-slate-south-002",
                rating: "3.30",
                title: "Fictional review: unclear menu note",
                text: "Fictional public review for seed data: The menu note about spice level was unclear, and one dish arrived stronger than our table expected.",
                sentiment: Sentiment.MIXED,
                sentimentScore: "0.0600",
                themes: ["menu clarity", "spice level", "expectations"],
                publishedAt: new Date("2026-05-31T20:30:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-slate-south-002"
              }
            ]
          },
          {
            id: "00000000-0000-4000-8000-000000000408",
            name: "Sample East Room",
            city: "Practice Port",
            region: "FD",
            timezone: "America/Los_Angeles",
            sourceId: "00000000-0000-4000-8000-000000000508",
            externalLocationId: "fictional-slate-east",
            reviews: [
              {
                id: "00000000-0000-4000-8000-000000000615",
                externalId: "fictional-review-slate-east-001",
                rating: "4.10",
                title: "Fictional review: balanced portions",
                text: "Fictional public review for seed data: Portions felt balanced for the price, and the staff checked whether we wanted more time before ordering dessert.",
                sentiment: Sentiment.POSITIVE,
                sentimentScore: "0.6600",
                themes: ["portion value", "dessert", "service timing"],
                publishedAt: new Date("2026-06-07T21:35:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-slate-east-001"
              },
              {
                id: "00000000-0000-4000-8000-000000000616",
                externalId: "fictional-review-slate-east-002",
                rating: "2.80",
                title: "Fictional review: follow-up needed",
                text: "Fictional public review for seed data: A missing side was corrected after we asked, though no one checked back until the end of the meal.",
                sentiment: Sentiment.NEGATIVE,
                sentimentScore: "-0.3600",
                themes: ["order accuracy", "check-back", "service recovery"],
                publishedAt: new Date("2026-06-14T22:15:00.000Z"),
                sourcePayloadHash: "fictional-seed-hash-slate-east-002"
              }
            ]
          }
        ]
      }
    ]
  }
];

const memberships: SeedMembership[] = [
  {
    agencySlug: "northstar-demo-agency",
    userEmail: "owner.northstar@example.test",
    role: MembershipRole.OWNER
  },
  {
    agencySlug: "northstar-demo-agency",
    userEmail: "analyst.northstar@example.test",
    role: MembershipRole.ANALYST
  },
  {
    agencySlug: "juniper-demo-agency",
    userEmail: "manager.juniper@example.test",
    role: MembershipRole.MANAGER
  },
  {
    agencySlug: "juniper-demo-agency",
    userEmail: "viewer.juniper@example.test",
    role: MembershipRole.VIEWER,
    restaurantSlug: "fictional-slate-spoon-bistro"
  }
];

const insights: SeedInsight[] = [
  {
    id: "00000000-0000-4000-8000-000000000701",
    agencySlug: "northstar-demo-agency",
    restaurantSlug: "fictional-elm-ember-kitchen",
    createdByEmail: "analyst.northstar@example.test",
    type: InsightType.THEME,
    title: "Draft theme: service execution is steady while timing needs review",
    summary:
      "Across the linked fictional reviews, guests describe organized service and clear host or server handoffs. Pickup timing and dining room noise appear as recurring points to review before presenting this as client advice.",
    sentiment: Sentiment.MIXED,
    themes: ["service", "pickup timing", "dining room experience"],
    confidence: "0.6800",
    confidenceLevel: ConfidenceLevel.MEDIUM,
    highImpact: false,
    sourceReviewIds: [
      "00000000-0000-4000-8000-000000000601",
      "00000000-0000-4000-8000-000000000602",
      "00000000-0000-4000-8000-000000000604"
    ]
  },
  {
    id: "00000000-0000-4000-8000-000000000702",
    agencySlug: "northstar-demo-agency",
    restaurantSlug: "fictional-birch-ladle-cafe",
    createdByEmail: "analyst.northstar@example.test",
    type: InsightType.OPPORTUNITY,
    title: "Draft opportunity: clarify availability and wait communication",
    summary:
      "The fictional seed reviews point to positive breakfast quality and calm morning service. The lower-confidence opportunity is to review menu availability and seating updates because both topics appear in linked source reviews.",
    sentiment: Sentiment.MIXED,
    themes: ["menu availability", "wait communication", "breakfast quality"],
    confidence: "0.6400",
    confidenceLevel: ConfidenceLevel.MEDIUM,
    highImpact: false,
    sourceReviewIds: [
      "00000000-0000-4000-8000-000000000605",
      "00000000-0000-4000-8000-000000000606",
      "00000000-0000-4000-8000-000000000608"
    ]
  },
  {
    id: "00000000-0000-4000-8000-000000000703",
    agencySlug: "juniper-demo-agency",
    restaurantSlug: "fictional-cedar-table",
    createdByEmail: "manager.juniper@example.test",
    type: InsightType.REVIEW_SUMMARY,
    title: "Draft summary: menu guidance is positive, closing moments vary",
    summary:
      "Linked fictional reviews mention useful menu guidance and reliable dinner service. Service recovery opportunities are limited to food temperature and checkout timing, so the insight should stay draft until a human reviews more evidence.",
    sentiment: Sentiment.MIXED,
    themes: ["menu guidance", "service recovery", "checkout timing"],
    confidence: "0.6200",
    confidenceLevel: ConfidenceLevel.MEDIUM,
    highImpact: false,
    sourceReviewIds: [
      "00000000-0000-4000-8000-000000000609",
      "00000000-0000-4000-8000-000000000610",
      "00000000-0000-4000-8000-000000000612"
    ]
  },
  {
    id: "00000000-0000-4000-8000-000000000704",
    agencySlug: "juniper-demo-agency",
    restaurantSlug: "fictional-slate-spoon-bistro",
    createdByEmail: "manager.juniper@example.test",
    type: InsightType.RISK,
    title: "Draft risk: menu clarity and check-backs need evidence review",
    summary:
      "The fictional review set includes strong comments on patio service and course pacing, alongside concerns about menu clarity and check-back timing. Treat this as a draft risk because the sample is intentionally small.",
    sentiment: Sentiment.MIXED,
    themes: ["menu clarity", "check-back timing", "course pacing"],
    confidence: "0.6000",
    confidenceLevel: ConfidenceLevel.MEDIUM,
    highImpact: false,
    sourceReviewIds: [
      "00000000-0000-4000-8000-000000000613",
      "00000000-0000-4000-8000-000000000614",
      "00000000-0000-4000-8000-000000000616"
    ]
  }
];

function mustGet<T>(map: Map<string, T>, key: string, label: string): T {
  const value = map.get(key);

  if (!value) {
    throw new Error(`Missing seeded ${label}: ${key}`);
  }

  return value;
}

async function main() {
  const agencyBySlug = new Map<string, Awaited<ReturnType<typeof prisma.agency.upsert>>>();
  const userByEmail = new Map<string, Awaited<ReturnType<typeof prisma.user.upsert>>>();
  const restaurantBySlug = new Map<string, Awaited<ReturnType<typeof prisma.restaurant.upsert>>>();
  const reviewBySeedId = new Map<string, Awaited<ReturnType<typeof prisma.review.upsert>>>();

  for (const agency of agencies) {
    const seededAgency = await prisma.agency.upsert({
      where: { slug: agency.slug },
      update: {
        name: agency.name,
        plan: agency.plan,
        status: AgencyStatus.ACTIVE,
        settings: {
          demoData: true,
          dataNotice: "All seeded restaurant records are fictional and for local development only."
        },
        deletedAt: null
      },
      create: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        plan: agency.plan,
        status: AgencyStatus.ACTIVE,
        settings: {
          demoData: true,
          dataNotice: "All seeded restaurant records are fictional and for local development only."
        }
      }
    });

    agencyBySlug.set(agency.slug, seededAgency);
  }

  for (const user of users) {
    const seededUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        authProvider: AuthProvider.EMAIL,
        externalAuthId: null,
        status: UserStatus.ACTIVE,
        deletedAt: null
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        authProvider: AuthProvider.EMAIL,
        status: UserStatus.ACTIVE
      }
    });

    userByEmail.set(user.email, seededUser);
  }

  for (const agency of agencies) {
    const seededAgency = mustGet(agencyBySlug, agency.slug, "agency");

    for (const restaurant of agency.restaurants) {
      const seededRestaurant = await prisma.restaurant.upsert({
        where: {
          agencyId_slug: {
            agencyId: seededAgency.id,
            slug: restaurant.slug
          }
        },
        update: {
          name: restaurant.name,
          segment: restaurant.segment,
          cuisine: restaurant.cuisine,
          websiteUrl: null,
          notes: "Fictional demo restaurant for seed data. Do not treat as a real restaurant record.",
          status: RestaurantStatus.ACTIVE,
          deletedAt: null
        },
        create: {
          id: restaurant.id,
          agencyId: seededAgency.id,
          name: restaurant.name,
          slug: restaurant.slug,
          segment: restaurant.segment,
          cuisine: restaurant.cuisine,
          notes: "Fictional demo restaurant for seed data. Do not treat as a real restaurant record.",
          status: RestaurantStatus.ACTIVE
        }
      });

      restaurantBySlug.set(`${agency.slug}:${restaurant.slug}`, seededRestaurant);

      for (const location of restaurant.locations) {
        const seededLocation = await prisma.location.upsert({
          where: {
            agencyId_restaurantId_name: {
              agencyId: seededAgency.id,
              restaurantId: seededRestaurant.id,
              name: location.name
            }
          },
          update: {
            addressLine1: "Fictional seed address, not a real restaurant location",
            addressLine2: null,
            city: location.city,
            region: location.region,
            postalCode: null,
            country: "US",
            timezone: location.timezone,
            latitude: null,
            longitude: null,
            status: LocationStatus.ACTIVE,
            deletedAt: null
          },
          create: {
            id: location.id,
            agencyId: seededAgency.id,
            restaurantId: seededRestaurant.id,
            name: location.name,
            addressLine1: "Fictional seed address, not a real restaurant location",
            city: location.city,
            region: location.region,
            country: "US",
            timezone: location.timezone,
            status: LocationStatus.ACTIVE
          }
        });

        const seededSource = await prisma.reviewSource.upsert({
          where: {
            agencyId_sourceType_externalLocationId: {
              agencyId: seededAgency.id,
              sourceType: ReviewSourceType.CSV_IMPORT,
              externalLocationId: location.externalLocationId
            }
          },
          update: {
            restaurantId: seededRestaurant.id,
            locationId: seededLocation.id,
            name: `Fictional CSV Import - ${restaurant.name} ${location.name}`,
            approvalStatus: SourceApprovalStatus.APPROVED,
            connectionStatus: ReviewSourceConnectionStatus.CONNECTED,
            externalAccountId: `fictional-seed-${agency.slug}`,
            permissionNotes:
              "Approved local seed source. Reviews are fictional examples and were not collected from a real platform.",
            lastSyncAt: collectedAt,
            nextSyncAt: null,
            lastError: null,
            deletedAt: null
          },
          create: {
            id: location.sourceId,
            agencyId: seededAgency.id,
            restaurantId: seededRestaurant.id,
            locationId: seededLocation.id,
            name: `Fictional CSV Import - ${restaurant.name} ${location.name}`,
            sourceType: ReviewSourceType.CSV_IMPORT,
            approvalStatus: SourceApprovalStatus.APPROVED,
            connectionStatus: ReviewSourceConnectionStatus.CONNECTED,
            externalAccountId: `fictional-seed-${agency.slug}`,
            externalLocationId: location.externalLocationId,
            permissionNotes:
              "Approved local seed source. Reviews are fictional examples and were not collected from a real platform.",
            lastSyncAt: collectedAt
          }
        });

        for (const review of location.reviews) {
          const seededReview = await prisma.review.upsert({
            where: {
              agencyId_reviewSourceId_externalId: {
                agencyId: seededAgency.id,
                reviewSourceId: seededSource.id,
                externalId: review.externalId
              }
            },
            update: {
              restaurantId: seededRestaurant.id,
              locationId: seededLocation.id,
              rating: review.rating,
              title: review.title,
              text: review.text,
              language: "en",
              sentiment: review.sentiment,
              sentimentScore: review.sentimentScore,
              themes: { set: review.themes },
              authorDisplayNameHash: "fictional-seed-author",
              reviewUrl: null,
              sourcePayloadHash: review.sourcePayloadHash,
              metadata: {
                fictional: true,
                publicSample: true,
                dataNotice: "Seeded review text is fictional and not from a real restaurant or review platform."
              },
              publishedAt: review.publishedAt,
              collectedAt,
              deletedAt: null
            },
            create: {
              id: review.id,
              agencyId: seededAgency.id,
              restaurantId: seededRestaurant.id,
              locationId: seededLocation.id,
              reviewSourceId: seededSource.id,
              externalId: review.externalId,
              rating: review.rating,
              title: review.title,
              text: review.text,
              language: "en",
              sentiment: review.sentiment,
              sentimentScore: review.sentimentScore,
              themes: review.themes,
              authorDisplayNameHash: "fictional-seed-author",
              sourcePayloadHash: review.sourcePayloadHash,
              metadata: {
                fictional: true,
                publicSample: true,
                dataNotice: "Seeded review text is fictional and not from a real restaurant or review platform."
              },
              publishedAt: review.publishedAt,
              collectedAt
            }
          });

          reviewBySeedId.set(review.id, seededReview);
        }
      }
    }
  }

  for (const membership of memberships) {
    const seededAgency = mustGet(agencyBySlug, membership.agencySlug, "agency");
    const seededUser = mustGet(userByEmail, membership.userEmail, "user");
    const restaurantId = membership.restaurantSlug
      ? mustGet(restaurantBySlug, `${membership.agencySlug}:${membership.restaurantSlug}`, "restaurant").id
      : null;

    await prisma.membership.upsert({
      where: {
        agencyId_userId: {
          agencyId: seededAgency.id,
          userId: seededUser.id
        }
      },
      update: {
        invitedByUserId: null,
        restaurantId,
        role: membership.role,
        status: MembershipStatus.ACTIVE,
        invitedAt: acceptedAt,
        acceptedAt,
        deletedAt: null
      },
      create: {
        agencyId: seededAgency.id,
        userId: seededUser.id,
        restaurantId,
        role: membership.role,
        status: MembershipStatus.ACTIVE,
        invitedAt: acceptedAt,
        acceptedAt
      }
    });
  }

  for (const insight of insights) {
    const seededAgency = mustGet(agencyBySlug, insight.agencySlug, "agency");
    const seededRestaurant = mustGet(
      restaurantBySlug,
      `${insight.agencySlug}:${insight.restaurantSlug}`,
      "restaurant"
    );
    const createdBy = mustGet(userByEmail, insight.createdByEmail, "user");

    const seededInsight = await prisma.insight.upsert({
      where: { id: insight.id },
      update: {
        agencyId: seededAgency.id,
        restaurantId: seededRestaurant.id,
        locationId: null,
        createdByUserId: createdBy.id,
        reviewedByUserId: null,
        type: insight.type,
        title: insight.title,
        summary: insight.summary,
        sentiment: insight.sentiment,
        themes: { set: insight.themes },
        confidence: insight.confidence,
        confidenceLevel: insight.confidenceLevel,
        model: "seeded-demo-insight-v1",
        promptVersion: "seed-v1",
        sourceReviewCount: insight.sourceReviewIds.length,
        highImpact: insight.highImpact,
        status: InsightStatus.DRAFT,
        reviewedAt: null,
        reviewNotes: null,
        generatedAt: collectedAt,
        deletedAt: null
      },
      create: {
        id: insight.id,
        agencyId: seededAgency.id,
        restaurantId: seededRestaurant.id,
        createdByUserId: createdBy.id,
        type: insight.type,
        title: insight.title,
        summary: insight.summary,
        sentiment: insight.sentiment,
        themes: insight.themes,
        confidence: insight.confidence,
        confidenceLevel: insight.confidenceLevel,
        model: "seeded-demo-insight-v1",
        promptVersion: "seed-v1",
        sourceReviewCount: insight.sourceReviewIds.length,
        highImpact: insight.highImpact,
        status: InsightStatus.DRAFT,
        generatedAt: collectedAt
      }
    });

    for (const [index, reviewId] of insight.sourceReviewIds.entries()) {
      const seededReview = mustGet(reviewBySeedId, reviewId, "review");

      await prisma.insightSourceReview.upsert({
        where: {
          insightId_reviewId: {
            insightId: seededInsight.id,
            reviewId: seededReview.id
          }
        },
        update: {
          agencyId: seededAgency.id,
          relevanceScore: index === 0 ? "0.9000" : "0.7800",
          evidenceExcerpt: seededReview.text
        },
        create: {
          agencyId: seededAgency.id,
          insightId: seededInsight.id,
          reviewId: seededReview.id,
          relevanceScore: index === 0 ? "0.9000" : "0.7800",
          evidenceExcerpt: seededReview.text
        }
      });
    }
  }

  const restaurantCount = agencies.reduce((count, agency) => count + agency.restaurants.length, 0);
  const locationCount = agencies.reduce(
    (count, agency) =>
      count +
      agency.restaurants.reduce((restaurantCountForAgency, restaurant) => {
        return restaurantCountForAgency + restaurant.locations.length;
      }, 0),
    0
  );
  const reviewCount = agencies.reduce(
    (count, agency) =>
      count +
      agency.restaurants.reduce((restaurantCountForAgency, restaurant) => {
        return (
          restaurantCountForAgency +
          restaurant.locations.reduce((locationCountForRestaurant, location) => {
            return locationCountForRestaurant + location.reviews.length;
          }, 0)
        );
      }, 0),
    0
  );

  console.log(
    `Seeded ${agencies.length} agencies, ${users.length} users, ${memberships.length} memberships, ` +
      `${restaurantCount} restaurants, ${locationCount} locations, ${locationCount} approved review sources, ` +
      `${reviewCount} fictional reviews, and ${insights.length} draft AI insights.`
  );
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
