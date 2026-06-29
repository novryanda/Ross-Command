import 'dotenv/config';
import { guardSeedExecution, prisma } from './seed-shared';

const ORDER_ID = '403f7fe4-f65a-446c-911c-f49062c9ef44';
const UNIT_NAMES = ['Kodam I/Bukit Barisan', 'Kodam XXII/Raden Inten'];

async function resolveUnitMemberIds(unitId: string) {
  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit) {
    throw new Error(`Unit tidak ditemukan: ${unitId}`);
  }

  const memberships = await prisma.unitMember.findMany({
    where: {
      removedAt: null,
      unit: {
        deletedAt: null,
        path: { startsWith: unit.path },
      },
      user: { deletedAt: null },
    },
    distinct: ['userId'],
    select: { userId: true },
    orderBy: { joinedAt: 'asc' },
  });

  return memberships.map((item) => item.userId);
}

async function main() {
  guardSeedExecution();

  const order = await prisma.order.findUnique({
    where: { id: ORDER_ID },
    select: { id: true, title: true, status: true, sentAt: true, createdAt: true },
  });

  if (!order) {
    throw new Error(`Order tidak ditemukan: ${ORDER_ID}`);
  }

  console.log(`Menambahkan assignment untuk order: ${order.title}\n`);

  const units = await prisma.unit.findMany({
    where: { name: { in: UNIT_NAMES }, deletedAt: null },
    select: { id: true, name: true },
  });

  if (units.length !== UNIT_NAMES.length) {
    const found = new Set(units.map((unit) => unit.name));
    const missing = UNIT_NAMES.filter((name) => !found.has(name));
    throw new Error(`Satuan tidak ditemukan: ${missing.join(', ')}`);
  }

  const existingAssignments = await prisma.taskAssignment.findMany({
    where: { orderId: ORDER_ID },
    select: { userId: true },
  });
  const existingUserIds = new Set(existingAssignments.map((item) => item.userId));

  const assignedAt = order.sentAt ?? order.createdAt;
  let totalNewAssignments = 0;

  for (const unit of units) {
    const memberIds = await resolveUnitMemberIds(unit.id);
    const newMemberIds = memberIds.filter((userId) => !existingUserIds.has(userId));

    if (newMemberIds.length) {
      await prisma.taskAssignment.createMany({
        data: newMemberIds.map((userId) => ({
          orderId: ORDER_ID,
          userId,
          assignedAt,
        })),
      });
      newMemberIds.forEach((userId) => existingUserIds.add(userId));
      totalNewAssignments += newMemberIds.length;
    }

    await prisma.orderTarget.updateMany({
      where: {
        orderId: ORDER_ID,
        unitId: unit.id,
        targetAudience: 'all_members',
      },
      data: {
        resolvedMemberCount: memberIds.length,
      },
    });

    console.log(`   ${unit.name}: ${memberIds.length} anggota (${newMemberIds.length} assignment baru)`);
  }

  const totalAssignments = await prisma.taskAssignment.count({
    where: { orderId: ORDER_ID },
  });

  console.log(`\nSelesai. Assignment baru: ${totalNewAssignments}`);
  console.log(`Total assignment order: ${totalAssignments}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Gagal menambahkan assignment', error);
    await prisma.$disconnect();
    process.exit(1);
  });
