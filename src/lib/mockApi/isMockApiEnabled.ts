/** Server/client gate for catch-all mock routing and dev mock fallbacks. */
export function isMockApiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
}
