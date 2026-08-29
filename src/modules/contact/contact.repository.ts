import prisma from "../../lib/prisma";
import { ContactStatus, ContactSubject } from "@prisma/client";

export interface ContactListQuery {
  status?: ContactStatus;
  subject?: ContactSubject;
  search?: string;
  page?: number;
  limit?: number;
}

export class ContactRepository {
  async create(data: {
    name: string;
    email: string;
    phone?: string | null;
    subject: ContactSubject;
    message: string;
    relatedTo?: string | null;
    relatedId?: string | null;
    referenceNumber: string;
  }) {
    return prisma.contactSubmission.create({ data });
  }

  async findByReference(referenceNumber: string) {
    return prisma.contactSubmission.findUnique({
      where: { referenceNumber },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        respondedBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findMany(query: ContactListQuery) {
    const {
      status,
      subject,
      search,
      page = 1,
      limit = 20,
    } = query;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (subject) where.subject = subject;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.contactSubmission.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.contactSubmission.delete({ where: { id } });
  }
}

export const contactRepository = new ContactRepository();
