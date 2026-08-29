import test from "node:test";
import assert from "node:assert/strict";

import { contactSubmissionSchema } from "../src/modules/contact/contact.validation";
import { createResultVersionSchema, createIncidentSchema } from "../src/modules/results/result.validation";

test("public contact submission schema accepts valid payload", () => {
  const parsed = contactSubmissionSchema.parse({
    name: "Abebe Bekele",
    email: "abebe@example.com",
    phone: "+251911234567",
    subject: "EVENT_INQUIRY",
    message: "I would like to request information about the upcoming marathon schedule.",
    relatedTo: "EVENT",
    relatedId: "evt_123",
  });

  assert.equal(parsed.subject, "EVENT_INQUIRY");
  assert.equal(parsed.relatedTo, "EVENT");
});

test("public contact submission schema rejects short messages", () => {
  assert.throws(() => {
    contactSubmissionSchema.parse({
      name: "Abebe",
      email: "abebe@example.com",
      subject: "GENERAL_INQUIRY",
      message: "Too short",
    });
  });
});

test("result version schema accepts live score updates and metadata", () => {
  const parsed = createResultVersionSchema.parse({
    status: "LIVE",
    homeScore: 2,
    awayScore: 1,
    notes: "Goal scored in the 55th minute.",
    updatedByRole: "REFEREE",
  });

  assert.equal(parsed.homeScore, 2);
  assert.equal(parsed.awayScore, 1);
  assert.equal(parsed.status, "LIVE");
});

test("incident schema records an event timeline entry", () => {
  const parsed = createIncidentSchema.parse({
    type: "SCORE_CHANGE",
    description: "A penalty goal was awarded after VAR review.",
    severity: "MEDIUM",
    relatedPlayer: "player_42",
  });

  assert.equal(parsed.type, "SCORE_CHANGE");
  assert.equal(parsed.severity, "MEDIUM");
});
