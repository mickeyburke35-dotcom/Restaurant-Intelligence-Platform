import {
  AgencyStatus,
  MembershipRole,
  MembershipStatus,
  UserStatus
} from "@prisma/client";
import { z } from "zod";
import { badRequest, forbidden, unauthorized } from "@/lib/api-errors";
import { prisma } from "@/lib/prisma";

const agencyHeader = "x-agency-id";
const userHeader = "x-user-id";

const uuidSchema = z.string().uuid();

const writeRoles = new Set<MembershipRole>([
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
  MembershipRole.MANAGER,
  MembershipRole.ANALYST
]);

export type RequestContext = {
  agencyId: string;
  role: MembershipRole;
  userId: string | null;
};

function requireUuidHeader(headers: Headers, headerName: string): string {
  const value = headers.get(headerName);

  if (!value) {
    throw unauthorized(`Missing ${headerName} request context.`);
  }

  const parsed = uuidSchema.safeParse(value);

  if (!parsed.success) {
    throw badRequest(`${headerName} must be a valid UUID.`);
  }

  return parsed.data;
}

function optionalUuidHeader(headers: Headers, headerName: string): string | null {
  const value = headers.get(headerName);

  if (!value) {
    return null;
  }

  const parsed = uuidSchema.safeParse(value);

  if (!parsed.success) {
    throw badRequest(`${headerName} must be a valid UUID.`);
  }

  return parsed.data;
}

export async function getRequestContext(request: Request): Promise<RequestContext> {
  const agencyId = requireUuidHeader(request.headers, agencyHeader);
  const userId = optionalUuidHeader(request.headers, userHeader);

  if (!userId) {
    throw unauthorized(`Missing ${userHeader} request context.`);
  }

  const membership = await prisma.membership.findFirst({
    where: {
      agencyId,
      userId,
      deletedAt: null,
      status: MembershipStatus.ACTIVE,
      agency: {
        deletedAt: null,
        status: AgencyStatus.ACTIVE
      },
      user: {
        deletedAt: null,
        status: UserStatus.ACTIVE
      }
    },
    select: {
      role: true
    }
  });

  if (!membership) {
    throw forbidden("Active agency membership is required.");
  }

  return {
    agencyId,
    role: membership.role,
    userId
  };
}

export function assertCanManageReviewSources(context: RequestContext): void {
  if (!writeRoles.has(context.role)) {
    throw forbidden("Review source changes require an agency editor role.");
  }
}
