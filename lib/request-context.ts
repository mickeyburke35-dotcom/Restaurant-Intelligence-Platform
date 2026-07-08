import {
  AgencyStatus,
  MembershipRole,
  MembershipStatus,
  UserStatus,
  type Membership
} from "@prisma/client";
import { cookies, headers } from "next/headers";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export class AccessError extends Error {
  constructor(
    message: string,
    readonly statusCode: 401 | 403 = 401
  ) {
    super(message);
    this.name = "AccessError";
  }
}

export type AgencyRequestContext = {
  agencyId: string;
  agencyName: string;
  userId: string;
  userEmail: string;
  role: MembershipRole;
  restaurantId: string | null;
};

export type RequestContext = AgencyRequestContext;

const restaurantManagerRoles = new Set<MembershipRole>([
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
  MembershipRole.MANAGER
]);

const reviewWorkflowRoles = new Set<MembershipRole>([
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
  MembershipRole.MANAGER,
  MembershipRole.ANALYST
]);

function normalizeHeaderValue(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function firstAvailableValue(values: Array<string | undefined>): string | undefined {
  return values.find((value) => value !== undefined);
}

async function getRequestIdentity() {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const userEmail = firstAvailableValue([
    normalizeHeaderValue(headerStore.get("x-user-email")),
    normalizeHeaderValue(headerStore.get("x-authenticated-user-email")),
    normalizeHeaderValue(headerStore.get("x-supabase-user-email")),
    normalizeHeaderValue(cookieStore.get("restaurant_intelligence_user_email")?.value ?? null),
    normalizeHeaderValue(cookieStore.get("authenticated_user_email")?.value ?? null),
    normalizeHeaderValue(process.env.RESTAURANT_INTELLIGENCE_USER_EMAIL ?? null)
  ])?.toLowerCase();

  const userId = firstAvailableValue([
    normalizeHeaderValue(headerStore.get("x-user-id")),
    normalizeHeaderValue(headerStore.get("x-authenticated-user-id")),
    normalizeHeaderValue(headerStore.get("x-supabase-user-id")),
    normalizeHeaderValue(cookieStore.get("restaurant_intelligence_user_id")?.value ?? null),
    normalizeHeaderValue(process.env.RESTAURANT_INTELLIGENCE_USER_ID ?? null)
  ]);

  return {
    userEmail,
    userId
  };
}

function membershipToContext(
  membership: Pick<Membership, "agencyId" | "userId" | "role" | "restaurantId"> & {
    agency: { name: string };
    user: { email: string };
  }
): AgencyRequestContext {
  return {
    agencyId: membership.agencyId,
    agencyName: membership.agency.name,
    userId: membership.userId,
    userEmail: membership.user.email,
    role: membership.role,
    restaurantId: membership.restaurantId
  };
}

function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.slice(name.length + 1));
}

async function findActiveMembershipContext(where: {
  agencyId?: string;
  membershipId?: string;
  userEmail?: string;
  userId?: string;
}): Promise<RequestContext | null> {
  const userFilters = [
    where.userId ? { id: where.userId } : undefined,
    where.userEmail ? { email: where.userEmail } : undefined
  ].filter((filter): filter is { id: string } | { email: string } => Boolean(filter));

  const membership = await prisma.membership.findFirst({
    where: {
      ...(where.agencyId ? { agencyId: where.agencyId } : {}),
      ...(where.membershipId ? { id: where.membershipId } : {}),
      status: MembershipStatus.ACTIVE,
      deletedAt: null,
      agency: {
        status: AgencyStatus.ACTIVE,
        deletedAt: null
      },
      user: {
        status: UserStatus.ACTIVE,
        deletedAt: null,
        ...(userFilters.length > 0 ? { OR: userFilters } : {})
      }
    },
    include: {
      agency: {
        select: {
          name: true
        }
      },
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return membership ? membershipToContext(membership) : null;
}

export async function getRequestContext(request: Request): Promise<RequestContext> {
  const sessionToken = getCookieValue(request.headers.get("cookie"), AUTH_COOKIE_NAME);
  const session = await verifySessionToken(sessionToken);

  if (session) {
    const sessionContext = await findActiveMembershipContext({
      agencyId: session.agencyId,
      membershipId: session.membershipId,
      userId: session.userId
    });

    if (sessionContext) {
      return sessionContext;
    }

    throw new AccessError("No active agency membership was found for this session.", 403);
  }

  const agencyId = normalizeHeaderValue(request.headers.get("x-agency-id"));
  const userId = normalizeHeaderValue(request.headers.get("x-user-id"));
  const userEmail = normalizeHeaderValue(request.headers.get("x-user-email"))?.toLowerCase();

  if (agencyId && (userId || userEmail)) {
    const headerContext = await findActiveMembershipContext({
      agencyId,
      userEmail,
      userId
    });

    if (!headerContext) {
      throw new AccessError("No active agency membership was found for this request.", 403);
    }

    return headerContext;
  }

  return getActiveAgencyContext();
}

export async function getActiveAgencyContext(): Promise<AgencyRequestContext> {
  const identity = await getRequestIdentity();
  const userFilters = [
    identity.userId ? { id: identity.userId } : undefined,
    identity.userEmail ? { email: identity.userEmail } : undefined
  ].filter((filter): filter is { id: string } | { email: string } => Boolean(filter));

  if (userFilters.length > 0) {
    const membership = await prisma.membership.findFirst({
      where: {
        status: MembershipStatus.ACTIVE,
        deletedAt: null,
        agency: {
          status: AgencyStatus.ACTIVE,
          deletedAt: null
        },
        user: {
          status: UserStatus.ACTIVE,
          deletedAt: null,
          OR: userFilters
        }
      },
      include: {
        agency: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    if (!membership) {
      throw new AccessError("No active agency membership was found for this user.", 403);
    }

    return membershipToContext(membership);
  }

  if (process.env.NODE_ENV === "production") {
    throw new AccessError("Sign in to access restaurant management.", 401);
  }

  const fallbackMembership = await prisma.membership.findFirst({
    where: {
      status: MembershipStatus.ACTIVE,
      deletedAt: null,
      role: {
        in: [MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MANAGER]
      },
      agency: {
        status: AgencyStatus.ACTIVE,
        deletedAt: null
      },
      user: {
        status: UserStatus.ACTIVE,
        deletedAt: null
      }
    },
    include: {
      agency: {
        select: {
          name: true
        }
      },
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!fallbackMembership) {
    throw new AccessError("No active agency membership is available for restaurant management.", 401);
  }

  return membershipToContext(fallbackMembership);
}

export function canManageRestaurants(context: AgencyRequestContext): boolean {
  return restaurantManagerRoles.has(context.role) && context.restaurantId === null;
}

export function assertCanManageRestaurants(context: AgencyRequestContext): void {
  if (!canManageRestaurants(context)) {
    throw new AccessError("Your role cannot manage restaurants for this agency.", 403);
  }
}

export function canManageReviewSources(context: RequestContext): boolean {
  return reviewWorkflowRoles.has(context.role);
}

export function assertCanManageReviewSources(context: RequestContext): void {
  if (!canManageReviewSources(context)) {
    throw new AccessError("Your role cannot manage review source workflows for this agency.", 403);
  }
}
