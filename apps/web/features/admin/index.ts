/**
 * Admin Feature Module
 *
 * Exposes administrative verification queries, decision actions,
 * and immutable audit log data fetching.
 */

export { api, apiClient } from '@/lib/api/client';
export type { VerificationDecisionInput, AdminAuditLogEntry } from '@/lib/api/client';
