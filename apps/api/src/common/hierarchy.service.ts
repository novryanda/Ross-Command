import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ApiException } from './utils/api-exception.util';
import { Unit, UnitMember } from '@prisma/client';

@Injectable()
export class HierarchyService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveMembership(
    userId: string,
  ): Promise<(UnitMember & { unit: Unit }) | null> {
    return this.prisma.unitMember.findFirst({
      where: {
        userId,
        removedAt: null,
        unit: {
          deletedAt: null,
        },
      },
      include: {
        unit: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }

  async getCommandingUnits(userId: string): Promise<Unit[]> {
    return this.prisma.unit.findMany({
      where: {
        commanderId: userId,
        deletedAt: null,
      },
      orderBy: {
        path: 'asc',
      },
    });
  }

  async ensureCommander(userId: string): Promise<Unit[]> {
    const units = await this.getCommandingUnits(userId);
    if (!units.length) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'FORBIDDEN',
        'Akses hanya untuk pimpinan',
      );
    }
    return units;
  }

  async isCommander(userId: string): Promise<boolean> {
    const count = await this.prisma.unit.count({
      where: {
        commanderId: userId,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async getSubtreeUnitsForCommander(userId: string): Promise<Unit[]> {
    const commandUnits = await this.ensureCommander(userId);
    return this.prisma.unit.findMany({
      where: {
        deletedAt: null,
        OR: commandUnits.map((unit) => ({
          path: {
            startsWith: unit.path,
          },
        })),
      },
      orderBy: {
        path: 'asc',
      },
    });
  }

  async getSubordinateUserIds(userId: string): Promise<string[]> {
    const units = await this.getSubtreeUnitsForCommander(userId);
    if (!units.length) {
      return [];
    }

    const unitIds = units.map((unit) => unit.id);
    const memberships = await this.prisma.unitMember.findMany({
      where: {
        unitId: {
          in: unitIds,
        },
        removedAt: null,
        user: {
          deletedAt: null,
        },
      },
      distinct: ['userId'],
      select: {
        userId: true,
      },
    });

    return memberships.map((membership) => membership.userId);
  }

  async assertUserInHierarchy(
    commanderId: string,
    targetUserId: string,
  ): Promise<void> {
    const allowedUserIds = await this.getSubordinateUserIds(commanderId);
    if (!allowedUserIds.includes(targetUserId)) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'OUT_OF_HIERARCHY',
        'User target berada di luar cakupan hierarki pimpinan',
      );
    }
  }

  async assertUnitInHierarchy(
    commanderId: string,
    targetUnitId: string,
  ): Promise<void> {
    const units = await this.getSubtreeUnitsForCommander(commanderId);
    const exists = units.some((unit) => unit.id === targetUnitId);
    if (!exists) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'OUT_OF_HIERARCHY',
        'Satuan target berada di luar cakupan hierarki pimpinan',
      );
    }
  }

  async resolveUnitAllMemberIds(unitId: string): Promise<string[]> {
    const targetUnit = await this.prisma.unit.findFirst({
      where: {
        id: unitId,
        deletedAt: null,
      },
    });

    if (!targetUnit) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Satuan tidak ditemukan',
      );
    }

    const units = await this.prisma.unit.findMany({
      where: {
        deletedAt: null,
        path: {
          startsWith: targetUnit.path,
        },
      },
      select: { id: true },
    });

    const memberships = await this.prisma.unitMember.findMany({
      where: {
        unitId: { in: units.map((unit) => unit.id) },
        removedAt: null,
        user: { deletedAt: null },
      },
      distinct: ['userId'],
      select: { userId: true },
    });

    return memberships.map((membership) => membership.userId);
  }

  /** Assignees who receive/act on the task (leaders only for leader-only units). */
  async resolveUnitAssigneeIds(unitId: string): Promise<string[]> {
    return this.resolveUnitMemberIds(unitId);
  }

  async resolveUnitMemberIds(unitId: string): Promise<string[]> {
    const targetUnit = await this.prisma.unit.findFirst({
      where: {
        id: unitId,
        deletedAt: null,
      },
    });

    if (!targetUnit) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Satuan tidak ditemukan',
      );
    }

    const units = await this.prisma.unit.findMany({
      where: {
        deletedAt: null,
        path: {
          startsWith: targetUnit.path,
        },
      },
      select: {
        id: true,
        commanderId: true,
        leaderOnlyAssignments: true,
        commander: {
          select: {
            id: true,
            deletedAt: true,
          },
        },
      },
      orderBy: {
        path: 'asc',
      },
    });
    const memberUnitIds = units
      .filter((unit) => !unit.leaderOnlyAssignments)
      .map((unit) => unit.id);
    const memberIds = new Set<string>();

    for (const unit of units) {
      if (
        unit.leaderOnlyAssignments &&
        unit.commander?.id &&
        !unit.commander.deletedAt
      ) {
        memberIds.add(unit.commander.id);
      }
    }

    const memberships = await this.prisma.unitMember.findMany({
      where: {
        unitId: {
          in: memberUnitIds,
        },
        removedAt: null,
        user: {
          deletedAt: null,
        },
      },
      distinct: ['userId'],
      select: {
        userId: true,
      },
    });

    for (const membership of memberships) {
      memberIds.add(membership.userId);
    }

    return Array.from(memberIds);
  }

  async resolveUnitLeaderIds(unitId: string): Promise<string[]> {
    const targetUnit = await this.prisma.unit.findFirst({
      where: {
        id: unitId,
        deletedAt: null,
      },
    });

    if (!targetUnit) {
      throw new ApiException(
        HttpStatus.NOT_FOUND,
        'NOT_FOUND',
        'Satuan tidak ditemukan',
      );
    }

    const units = await this.prisma.unit.findMany({
      where: {
        deletedAt: null,
        commanderId: {
          not: null,
        },
        path: {
          startsWith: targetUnit.path,
        },
        commander: {
          deletedAt: null,
        },
      },
      select: {
        commanderId: true,
      },
      distinct: ['commanderId'],
    });

    return units
      .map((unit) => unit.commanderId)
      .filter((commanderId): commanderId is string => Boolean(commanderId));
  }
}
