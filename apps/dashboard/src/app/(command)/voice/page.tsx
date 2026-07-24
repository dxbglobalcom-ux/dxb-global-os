import { redirect } from "next/navigation";

// /voice → /chat (complaint ledger 1a-1e, 2026-07-24): the Ask-a-Director
// call line merged into the Chat with Hamza page as its voice section. The
// URL stays alive for muscle memory and old links; the §31 nav row moved
// with it (registered adaptation recorded at the ledger row closure).
export default function Page() {
  redirect("/chat");
}
