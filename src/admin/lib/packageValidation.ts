import { z } from 'zod';

/**
 * Shared "core" package schema — expiryDate is MANDATORY on every save.
 * The value comes from <input type="date"> as "YYYY-MM-DD".
 */
export const packageCoreSchema = z.object({
  name: z
    .string()
    .min(2, 'Package name must be at least 2 characters')
    .max(200, 'Package name cannot exceed 200 characters'),
  startingPrice: z.string().optional().default(''),
  description: z.string().optional().default(''),

  expiryDate: z
    .string()
    .min(1, 'Expiry date is required')
    .refine((v) => !Number.isNaN(new Date(v).getTime()), {
      message: 'Expiry date must be a valid date',
    }),
});

/**
 * Schema for NEW packages: the validity date must be in the future.
 * (Refinement deliberately NOT applied to edits of existing/legacy packages.)
 */
export const newPackageSchema = packageCoreSchema.refine(
  (data) => new Date(data.expiryDate).getTime() > Date.now(),
  {
    message: 'Expiry date must be in the future',
    path: ['expiryDate'],
  },
);

/**
 * Schema for EDITING existing packages: only requires a non-empty valid date,
 * so an admin can always fix (extend) an expired package instead of being
 * locked out of the form.
 */
export const editPackageSchema = packageCoreSchema;

export type PackageCoreSchema = z.infer<typeof packageCoreSchema>;
export type NewPackageSchema = z.infer<typeof newPackageSchema>;
export type EditPackageSchema = z.infer<typeof editPackageSchema>;

/** Standalone future-date check, usable outside Zod (e.g. per-keystroke UI). */
export function isFutureDate(value: string): boolean {
  if (!value) return false;
  const t = new Date(value).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

/**
 * Validates form values and returns field-level errors for direct rendering.
 * Returns { success: true, data } or { success: false, errors }.
 */
export function validatePackageForm(
  values: { name: string; startingPrice?: string; description?: string; expiryDate: string },
  mode: 'create' | 'edit',
): { success: boolean; data?: PackageCoreSchema; errors: Record<string, string> } {
  const schema = mode === 'create' ? newPackageSchema : editPackageSchema;
  const result = schema.safeParse(values);

  if (result.success) {
    return { success: true, data: result.data, errors: {} };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? '_form');
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
