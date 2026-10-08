import type { Metadata } from "next"
import { UsersRound } from "lucide-react"
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
import { getUsersPage } from "@/features/users/queries"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export const metadata: Metadata = { title: "Usuarios" }
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const { profiles, currentUserId, page, totalPages } = await getUsersPage(
    params.page
  )
  return (
    <div className="flex flex-col gap-8">
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
              <TableHead>Usuario</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">
                  {profile.full_name || "Sin nombre"}
                  {profile.id === currentUserId ? (
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
                    isCurrentUser={profile.id === currentUserId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {totalPages > 1 ? (
        <Pagination aria-label="Páginas de usuarios">
          <PaginationContent>
            {page > 1 ? (
              <PaginationItem>
                <PaginationPrevious
                  href={`/usuarios?page=${page - 1}`}
                  text="Anterior"
                  aria-label="Página anterior"
                />
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <span className="px-3 text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
            </PaginationItem>
            {page < totalPages ? (
              <PaginationItem>
                <PaginationNext
                  href={`/usuarios?page=${page + 1}`}
                  text="Siguiente"
                  aria-label="Página siguiente"
                />
              </PaginationItem>
            ) : null}
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  )
}
