import { ContactStatus, ContactSubject } from "@prisma/client";
import { BadRequestError } from "../../errors/BadRequestError";
import { NotFoundError } from "../../errors/NotFoundError";
import { contactRepository, ContactListQuery } from "./contact.repository";

export class ContactService {
  async submitContact(data: {
    name: string;
    email: string;
    phone?: string | null;
    subject: ContactSubject;
    message: string;
    relatedTo?: string | null;
    relatedId?: string | null;
  }) {
    const referenceNumber = this.generateReferenceNumber();
    const submission = await contactRepository.create({
      ...data,
      referenceNumber,
    });

    return {
      id: submission.id,
      referenceNumber: submission.referenceNumber,
      status: submission.status,
      createdAt: submission.createdAt,
    };
  }

  async getByReference(referenceNumber: string) {
    const submission = await contactRepository.findByReference(referenceNumber);
    if (!submission) throw new NotFoundError("Submission not found.");

    return {
      referenceNumber: submission.referenceNumber,
      status: submission.status,
      submittedAt: submission.createdAt,
      lastUpdated: submission.updatedAt,
    };
  }

  async listAdmin(query: ContactListQuery) {
    return contactRepository.findMany(query);
  }

  async getAdminById(id: string) {
    const submission = await contactRepository.findById(id);
    if (!submission) throw new NotFoundError("Submission not found.");

    return submission;
  }

  async updateAdmin(id: string, data: {
    status?: ContactStatus;
    adminNotes?: string | null;
    respond?: boolean;
    responderId?: string;
  }) {
    const existing = await contactRepository.findById(id);
    if (!existing) throw new NotFoundError("Submission not found.");

    const updates: Record<string, unknown> = {};
    if (data.status) updates.status = data.status;
    if (data.adminNotes !== undefined) updates.adminNotes = data.adminNotes;
    if (data.respond === true) updates.respondedAt = new Date();
    if (data.respond === true && data.responderId) updates.respondedById = data.responderId;

    if (Object.keys(updates).length === 0) {
      throw new BadRequestError("No fields to update.");
    }

    const updated = await contactRepository.update(id, updates);
    return { id: updated.id, status: updated.status };
  }

  async deleteAdmin(id: string) {
    const existing = await contactRepository.findById(id);
    if (!existing) throw new NotFoundError("Submission not found.");

    await contactRepository.delete(id);
    return { message: "Submission deleted." };
  }

  private generateReferenceNumber() {
    const year = new Date().getFullYear();
    const sequence = Math.floor(100000 + Math.random() * 900000);
    return `EACRMS-${year}-${sequence}`;
  }
}

export const contactService = new ContactService();
