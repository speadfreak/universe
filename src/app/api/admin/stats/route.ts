import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export const runtime = "nodejs";

/** GET /api/admin/stats — dashboard snapshot. */
export async function GET(req: Request) {
  const admin = requireRole(req as never, ["editor", "receptionist"]);
  if (!admin) {
    return NextResponse.json({ ok: false, error: { code: "unauthorized", message: "Unauthorized" } }, { status: 401 });
  }

  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const endToday = new Date(startToday);
  endToday.setDate(endToday.getDate() + 1);
  const endWeek = new Date(startToday);
  endWeek.setDate(endWeek.getDate() + 7);

  try {
    const [apptToday, apptWeek, newMessages, unreadTotal, publishedPosts, recentAppointments, recentMessages, subscribers] =
      await Promise.all([
        db.appointment.count({ where: { date: { gte: startToday, lt: endToday }, status: { notIn: ["cancelled"] } } }),
        db.appointment.count({ where: { date: { gte: startToday, lt: endWeek }, status: { notIn: ["cancelled"] } } }),
        db.contactMessage.count({ where: { status: "new" } }),
        db.contactMessage.count({ where: { status: "new" } }),
        db.blogPost.count({ where: { status: "published" } }),
        db.appointment.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
        db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
        db.newsletterSubscriber.count(),
      ]);

    return NextResponse.json({
      ok: true,
      data: {
        apptToday,
        apptWeek,
        newMessages,
        publishedPosts,
        subscribers,
        recentAppointments,
        recentMessages,
      },
    });
  } catch (err) {
    console.error("[admin/stats] failed:", err);
    return NextResponse.json({ ok: false, error: { code: "server_error", message: "Stats failed" } }, { status: 500 });
  }
}
