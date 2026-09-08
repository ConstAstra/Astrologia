import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as createInvite } from "@/app/api/friends/invite/route";
import { POST as acceptInvite } from "@/app/api/friends/invite/[token]/accept/route";
import { canViewProfile } from "@/lib/friends";

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function registerAndGetId(email: string, password: string) {
  const res = await register(jsonRequest("http://localhost/api/auth/register", "POST", { email, password }));
  const data = await res.json();
  return data.id as string;
}

const emailA = `vitest-viewperm-a-${Date.now()}@example.com`;
const emailB = `vitest-viewperm-b-${Date.now()}@example.com`;
const password = "viewperm12345";

// canViewProfile est le seul verrou entre un profil natal privé (date/heure/
// lieu de naissance, thème complet) et un autre compte : une régression ici
// est une fuite de données personnelles, pas juste un bug fonctionnel. Ce
// test fige chaque branche indépendamment plutôt que de se fier aux tests
// d'API existants, qui n'exercent que le chemin nominal.
describe("canViewProfile (authorization gate for a friend's chart)", () => {
  let userIdA: string;
  let userIdB: string;

  beforeAll(async () => {
    cookieJar.clear();
    userIdA = await registerAndGetId(emailA, password);
    cookieJar.clear();
    userIdB = await registerAndGetId(emailB, password);
  });

  it("always allows the profile's own owner, regardless of isSelf/shareWithFriends", async () => {
    const allowed = await canViewProfile(userIdA, {
      userId: userIdA,
      isSelf: false,
      shareWithFriends: false,
    });
    expect(allowed).toBe(true);
  });

  it("denies a stranger even for a shared self profile", async () => {
    const allowed = await canViewProfile(userIdB, {
      userId: userIdA,
      isSelf: true,
      shareWithFriends: true,
    });
    // A and B are not friends yet at this point in the suite.
    expect(allowed).toBe(false);
  });

  it("denies a non-self profile (e.g. mother, ex) even when shareWithFriends is true", async () => {
    const allowed = await canViewProfile(userIdB, {
      userId: userIdA,
      isSelf: false,
      shareWithFriends: true,
    });
    expect(allowed).toBe(false);
  });

  it("denies a self profile with sharing disabled, even between friends", async () => {
    const allowed = await canViewProfile(userIdB, {
      userId: userIdA,
      isSelf: true,
      shareWithFriends: false,
    });
    expect(allowed).toBe(false);
  });

  it("allows a friend to view a shared self profile once the friendship is accepted", async () => {
    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailA, password }));
    const inviteRes = await createInvite();
    const { token } = await inviteRes.json();

    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailB, password }));
    const acceptRes = await acceptInvite(
      new Request(`http://localhost/api/friends/invite/${token}/accept`, { method: "POST" }),
      { params: Promise.resolve({ token }) }
    );
    expect(acceptRes.status).toBe(200);

    const allowed = await canViewProfile(userIdB, {
      userId: userIdA,
      isSelf: true,
      shareWithFriends: true,
    });
    expect(allowed).toBe(true);
  });
});
