/**
 * Unified Database Module Entrypoint.
 *
 * Centralizes access to database client, Drizzle schemas,
 * and regional UP catalogue data while preserving existing drizzle.config.ts paths.
 */

export * from '../db/client';
export * from '../db/schema';
export * from '../db/data/upCatalogue';

// Convenient table aliases matching route conventions
export {
  users as usersTable,
  districts as districtsTable,
  craftDefinitions as craftDefinitionsTable,
  craftDistricts as craftDistrictsTable,
  artisanProfiles as artisanProfilesTable,
  products as productsTable,
  productImages as productImagesTable,
  adminAuditLogs as adminAuditLogsTable,
  aiInferenceLogs as aiInferenceLogsTable,
  orders as ordersTable,
  orderItems as orderItemsTable,
} from '../db/schema';
