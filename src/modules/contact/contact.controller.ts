import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { contactService } from "./contact.service";

export class ContactController {
  submit = asyncHandler(async (req: Request, res: Response) => {
    const submission = await contactService.submitContact(req.body);

    return res.status(201).json({
      success: true,
      message: "Your message has been received. We will respond within 48 hours.",
      data: submission,
    });
  });

  getStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.getByReference(req.params.referenceNumber as string);
    return res.status(200).json({ success: true, data: result });
  });

  listAdmin = asyncHandler(async (req: Request, res: Response) => {
    const status = (req.query.status as string | undefined) ?? undefined;
    const subject = (req.query.subject as string | undefined) ?? undefined;
    const search = (req.query.search as string | undefined) ?? undefined;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await contactService.listAdmin({
      status: status as any,
      subject: subject as any,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  });

  getAdminById = asyncHandler(async (req: Request, res: Response) => {
    const submission = await contactService.getAdminById(req.params.id as string);
    return res.status(200).json({ success: true, data: submission });
  });

  updateAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.updateAdmin(req.params.id as string, {
      status: req.body.status,
      adminNotes: req.body.adminNotes,
      respond: req.body.respond,
      responderId: req.user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Submission updated.",
      data: result,
    });
  });

  deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.deleteAdmin(req.params.id as string);
    return res.status(200).json({ success: true, message: result.message });
  });
}

export const contactController = new ContactController();
