import { execSync } from "node:child_process";

// Base de données Postgres dédiée aux tests (voir README, "Base de
// données"), isolée de la base de dev — remise à plat (schéma "public"
// recréé) à chaque lancement de la suite pour repartir d'un état propre.
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://postgres:astrologium_dev@localhost:5432/astrologium_test";

export default function setup() {
  execSync('psql "$DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"', {
    cwd: __dirname,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });

  execSync("npx prisma migrate deploy", {
    cwd: __dirname,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });
}
