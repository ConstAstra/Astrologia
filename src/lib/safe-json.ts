// Tolerates a non-JSON response body (e.g. a proxy/gateway error page)
// instead of letting a raw SyntaxError from res.json() reach the caller.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
