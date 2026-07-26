export const ADMIN_EMAILS = [
  "mohitabinavm2027@email.iimcal.ac.in",
  "jananis2027@email.iimcal.ac.in",
  "sportscouncil@email.iimcal.ac.in"
];

export function isAdmin(email?: string): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}