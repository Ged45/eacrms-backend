import { PolicyType, PolicyScope, PolicyStatus } from "@prisma/client";

/**
 * Input payload for creating a new policy
 */
export interface CreatePolicyInput {
  name: string;
  description?: string;
  type: PolicyType;
  content: string;
  scope: PolicyScope;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

/**
 * Input payload for updating an existing policy
 */
export interface UpdatePolicyInput {
  name?: string;
  description?: string;
  type?: PolicyType;
  content?: string;
  scope?: PolicyScope;
  status?: PolicyStatus;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

/**
 * Filter parameters for querying policies
 */
export interface PolicyFilterParams {
  status?: PolicyStatus;
  scope?: PolicyScope;
  type?: PolicyType;
  search?: string;
}

/**
 * Policy model shape representation
 */
export interface PolicyResponse {
  id: string;
  name: string;
  description?: string | null;
  type: PolicyType;
  content: string;
  scope: PolicyScope;
  status: PolicyStatus;
  version: number;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  createdById: string;
  updatedById?: string | null;
  approvedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}