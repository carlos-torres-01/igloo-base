import type { Database } from "@/types/database"

export type UserRole = Database["public"]["Enums"]["app_role"]
export type UserProfile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "full_name" | "role" | "is_active"
>
