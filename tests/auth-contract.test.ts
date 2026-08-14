import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLoginResponse,
  issueFaydaVerificationToken,
  verifyFaydaVerificationToken,
} from "../src/utils/auth-contract";

test("login response includes mobile contract fields", () => {
  const result = buildLoginResponse({
    userId: "usr_123",
    email: "athlete@example.com",
    firstName: "Abebe",
    lastName: "Bekele",
    status: "ACTIVE",
    roles: ["ATHLETE"],
    accessToken: "access-token",
    refreshToken: "refresh-token",
    fanNumber: "1456-1245-7895-9557",
    clubId: "club_123",
    clubName: "Addis Ababa FC",
  });

  assert.equal(result.token, "access-token");
  assert.equal(result.userId, "usr_123");
  assert.equal(result.userRole, "athlete");
  assert.equal(result.refreshToken, "refresh-token");
  assert.equal(result.fanNumber, "1456-1245-7895-9557");
  assert.equal(result.clubId, "club_123");
  assert.equal(result.clubName, "Addis Ababa FC");
  assert.equal(result.status, "ACTIVE");
});

test("fayda verification token contains demographic data and expiry", () => {
  const token = issueFaydaVerificationToken({
    nin: "ETH-19950810-001",
    firstName: "Abebe",
    lastName: "Bekele",
    dateOfBirth: "1995-08-10",
    gender: "MALE",
    phoneNumber: "+251911000000",
    fanNumber: "1456-1245-7895-9557",
  });

  assert.ok(typeof token === "string" && token.length > 20);

  const decoded = verifyFaydaVerificationToken(token);
  assert.equal(decoded.nin, "ETH-19950810-001");
  assert.equal(decoded.fanNumber, "1456-1245-7895-9557");
  assert.equal(decoded.firstName, "Abebe");
  assert.equal(decoded.gender, "MALE");
  assert.ok(decoded.exp! > Math.floor(Date.now() / 1000));
});
