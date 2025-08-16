import { Request } from "@playwright/test";

export async function checkAuthorization(request: Request) {
  const authHeaderValue = await request.headerValue("authorization");
  if (!authHeaderValue) return false;

  const authToken = authHeaderValue.split(" ")[1];
  if (!authToken) return false;

  return true;
}
