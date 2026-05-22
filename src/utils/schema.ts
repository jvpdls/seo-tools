/** True when at least one own value is not `undefined`. */
export const hasDefinedValue = (
  values: Record<string, unknown>,
): boolean => Object.values(values).some((value) => value !== undefined);
