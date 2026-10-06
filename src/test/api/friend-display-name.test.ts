import { describe, it, expect, beforeAll } from "vitest";
import "@/test/setup";
import { cookieJar } from "@/test/setup";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as createInvite } from "@/app/api/friends/invite/route";
import { POST as acceptInvite } from "@/app/api/friends/invite/[token]/accept/route";
import { listFriendSelfProfiles } from "@/lib/friends";
import { prisma } from "@/lib/db";

function jsonRequest(url: string, method: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

const emailA = `vitest-displayname-a-${Date.now()}@example.com`;
const emailB = `vitest-displayname-b-${Date.now()}@example.com`;
const password = "displayname12345";

// Régression : le nom affiché pour un ami retombait sur l'intitulé qu'il a
// donné à SON PROPRE profil (profile.label, souvent "Moi" — c'est la
// suggestion par défaut du formulaire) faute de prénom de compte renseigné,
// ce qui affichait littéralement "Moi" pour désigner l'ami dans la propre
// liste/sélecteur de l'utilisateur. La fonction doit au moins exposer
// l'e-mail pour que les pages appelantes puissent s'en servir de repli.
describe("listFriendSelfProfiles", () => {
  let userIdA: string;

  beforeAll(async () => {
    cookieJar.clear();
    const resA = await register(jsonRequest("http://localhost/api/auth/register", "POST", { email: emailA, password }));
    userIdA = (await resA.json()).id;
    cookieJar.clear();
    await register(jsonRequest("http://localhost/api/auth/register", "POST", { email: emailB, password }));

    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailA, password }));
    const inviteRes = await createInvite();
    const { token } = await inviteRes.json();

    cookieJar.clear();
    await login(jsonRequest("http://localhost/api/auth/login", "POST", { email: emailB, password }));
    await acceptInvite(new Request(`http://localhost/api/friends/invite/${token}/accept`, { method: "POST" }), {
      params: Promise.resolve({ token }),
    });

    await prisma.profile.create({
      data: {
        userId: userIdA,
        label: "Moi",
        isSelf: true,
        birthDate: "1990-01-01",
        birthTime: "12:00",
        locationName: "Nowhere",
        latitude: 0,
        longitude: 0,
        tzName: "UTC",
        shareWithFriends: true,
      },
    });
  });

  it("exposes the friend's email so callers never have to fall back to the friend's own private profile label", async () => {
    const friends = await listFriendSelfProfiles((await prisma.user.findUniqueOrThrow({ where: { email: emailB } })).id);
    expect(friends).toHaveLength(1);
    expect(friends[0].email).toBe(emailA);
    // The account has no display name set, and the friend's own profile is
    // labeled "Moi" — a caller must be able to fall back to something other
    // than that "Moi" to identify this friend to a third party.
    expect(friends[0].name).toBeNull();
  });
});
