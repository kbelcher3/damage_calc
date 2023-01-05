export function encodeBase64(instr: string): string {
  const raw = btoa(unescape(encodeURIComponent(instr)));
  return raw
    .replace(/\//g, "_")
    .replace(/\+/g, "-")
    .replace(/=+/, "");
}

export function decodeBase64(instr: string): string {
  const raw = (instr + "===".slice((instr.length + 3) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return decodeURIComponent(escape(atob(raw)));
}
