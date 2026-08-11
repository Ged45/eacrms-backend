import Postmark from "postmark";

function getPostmarkClient(): Postmark.ServerClient | null {
  const token = process.env.POSTMARK_API_TOKEN;
  if (!token) return null;
  return new Postmark.ServerClient(token);
}

export async function sendViaPostmark(options: {
  to: string;
  subject?: string;
  html?: string;
  templateId?: number;
  templateModel?: Record<string, unknown>;
}): Promise<any | void> {
  const client = getPostmarkClient();
  if (!client) return;

  const from = process.env.POSTMARK_SENDER ?? "onboarding@postmarkapp.com";

  if (options.templateId) {
    return client.sendEmailWithTemplate({
      From: from,
      To: options.to,
      TemplateId: options.templateId,
      TemplateModel: options.templateModel ?? {},
    });
  }

  return client.sendEmail({
    From: from,
    To: options.to,
    Subject: options.subject ?? "Verify your EACRMS account",
    HtmlBody: options.html ?? "",
  });
}

export function hasPostmark(): boolean {
  return Boolean(process.env.POSTMARK_API_TOKEN);
}
