import {
  AgencyStatus,
  MembershipStatus,
  UserStatus,
  type MembershipRole
} from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

export type ActiveAuthContext = {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  agency: {
    id: string;
    name: string;
    slug: string;
  };
  membership: {
    id: string;
    role: MembershipRole;
    restaurantId: string | null;
  };
};

export async function getActiveAuthContext(): Promise<ActiveAuthContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return null;
  }

  const membership = await prisma.membership.findFirst({
    where: {
      id: session.membershipId,
      userId: session.userId,
      agencyId: session.agencyId,
      status: MembershipStatus.ACTIVE,
      deletedAt: null,
      agency: {
        status: AgencyStatus.ACTIVE,
        deletedAt: null
      },
      user: {
        status: UserStatus.ACTIVE,
        deletedAt: null
      }
    },
    select: {
      id: true,
      role: true,
      restaurantId: true,
      agency: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  if (!membership) {
    return null;
  }

  return {
    user: membership.user,
    agency: membership.agency,
    membership: {
      id: membership.id,
      role: membership.role,
      restaurantId: membership.restaurantId
    }
  };
}

export async function requireActiveAuthContext(nextPath = "/workspace") {
  const context = await getActiveAuthContext();

  if (!context) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  return context;
}
