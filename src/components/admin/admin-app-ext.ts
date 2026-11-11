export type View =
  | { kind: "dashboard" }
  | { kind: "content" }
  | { kind: "collection"; entity: string }
  | { kind: "media" }
  | { kind: "inbox"; tab: "messages" | "appointments" }
  | { kind: "settings" }
  | { kind: "audit" };
