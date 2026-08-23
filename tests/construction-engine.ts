/**
 * THE construction site's own database engine — spelled once, here.
 *
 * B36 Block 2. Until 2026-08-23 the battery wrote into `dxb_test`, a database
 * that lived inside the COMPANY's Postgres engine — one wrong character in an
 * address and a suite was writing into the holding's own books. The clone was
 * a name, not a wall.
 *
 * Now the construction site has its own engine: its own Supabase project
 * (`DxB_Build`), its own containers, its own ports, its own volume, its own
 * cluster identifier. The company does not exist on this port at all, so a
 * mistyped address lands nowhere instead of landing on the CEO's data.
 *
 *   company      127.0.0.1:54322   its own cluster, its own volume
 *   construction 127.0.0.1:54422   its own cluster, its own volume
 *
 * The cluster identifiers are deliberately NOT written here. Destroying the
 * construction stack (`pnpm construction:stop --no-backup`) gives it a brand new
 * one, so a number quoted in a comment is a lie a week later. The identity that
 * matters lives in tools/hooks/ledger-identity.json, is taken from the server
 * with `scripts/b36/ledger-identity.mjs --allow`, and is re-taken after a
 * rebuild — the guard fails closed until it is.
 *
 * The credentials are the Supabase CLI's fixed local ones (`postgres:postgres`)
 * — the CLI has no field for a local database password, measured against
 * supabase/config.toml on CLI 2.109.0. The wall here is the engine and the
 * port; the credential wall is Block 3's `dxb_reader`, which takes the
 * company's write privilege away from the construction side at the server.
 *
 * Anything that needs the construction database imports THIS constant. A
 * second spelling anywhere is the defect that Block 1 spent three audits on.
 */
export const CONSTRUCTION_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:54422/postgres";
