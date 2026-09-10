import prisma from "@/lib/prisma";

export async function logAuditAction({
  userId,
  role,
  action,
  targetEntity,
  targetEntityId,
  metadata,
  ipAddress,
}: {
  userId?: string;
  role?: string;
  action: string;
  targetEntity: string;
  targetEntityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        role: role || null,
        action,
        targetEntity,
        targetEntityId: targetEntityId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress: ipAddress || "127.0.0.1",
      },
    });
  } catch (err) {
    console.error("Audit log creation error:", err);
  }
}
