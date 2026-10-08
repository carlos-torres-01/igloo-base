import type { Metadata } from "next"
import {
  BadgeCheck,
  Mail,
  MousePointerClick,
  ShieldCheck,
  UsersRound,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CreateUserDialog } from "@/features/users/create-user-dialog"
import { EditUserDialog } from "@/features/users/edit-user-dialog"
import { requireAdmin } from "@/lib/auth"

export const metadata: Metadata = { title: "Usuarios" }
export default async function UsersPage() {
  const { supabase, user } = await requireAdmin()
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active")
    .order("full_name")
  if (error) throw new Error(error.message)
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administración"
        title="Usuarios"
        description="Gestiona el acceso, el rol y el estado de cada usuario."
        actions={<CreateUserDialog />}
      />
      {!profiles?.length ? (
        <EmptyState
          icon={UsersRound}
          title="Sin usuarios"
          description="Crea el primer usuario para administrar su acceso."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <UsersRound className="inline size-3.5" /> Usuario
              </TableHead>
              <TableHead>
                <Mail className="inline size-3.5" /> Correo
              </TableHead>
              <TableHead>
                <ShieldCheck className="inline size-3.5" /> Rol
              </TableHead>
              <TableHead>
                <BadgeCheck className="inline size-3.5" /> Estado
              </TableHead>
              <TableHead className="text-right">
                <MousePointerClick className="inline size-3.5" /> Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  {profile.full_name || "Sin nombre"}
                  {profile.id === user.id ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Tú
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {profile.email}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {profile.role === "admin" ? "Administrador" : "Usuario"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={profile.is_active ? "active" : "inactive"}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <EditUserDialog
                    profile={profile}
                    isCurrentUser={profile.id === user.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
