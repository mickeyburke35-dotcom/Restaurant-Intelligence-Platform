import { AgencyStatus, MembershipStatus, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function resolveActiveMembershipForSignIn(email: string, agencySlug?: string) {
  return prisma.membership.findFirst({
    where: {
      status: MembershipStatus.ACTIVE,
      deletedAt: null,
      agency: {
        ...(agencySlug ? { slug: agencySlug } : {}),
        status: AgencyStatus.ACTIVE,
        deletedAt: null
      },
      user: {
        email: {
          equals: email,
          mode: "insensitive"
        },
        status: UserStatus.ACTIVE,
        deletedAt: null
      }
    },
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      role: true,
      restaurantId: true,
      userId: true,
      agencyId: true,
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
}

export async function recordUserSignIn(userId: string) {
  await prisma.user.update({
    where: {
      id: userId
    },
    data: {
      lastSignInAt: new Date()
    }
  });
}
