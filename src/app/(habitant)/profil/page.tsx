"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, FileText, LogIn, LogOut, Pencil, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PhotoUpload } from "@/components/ui/PhotoUpload";
import { Skeleton } from "@/components/ui/Skeleton";
import { userApi } from "@/lib/api/user";
import { QUERY_KEYS } from "@/lib/api/queryKeys";
import { AVATAR_QUERY_KEY, useAuthedImage } from "@/lib/hooks/useAuthedImage";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAuthStore } from "@/lib/store/authStore";
import { useCurrentVilla } from "@/lib/hooks/useCurrentVilla";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { apiErrorMessage } from "@/lib/utils/apiError";
import { cn } from "@/lib/utils/cn";
import { formatRelative } from "@/lib/utils/formatDate";

export default function ProfilPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const me = useCurrentVilla();
  const qc = useQueryClient();
  const { notifications, unreadCount, markRead, readAll } = useNotifications();

  const notifs = notifications.data ?? [];
  const fullName = `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim();

  // Photo de profil : upload à la volée ; l'affichage passe par un blob
  // chargé avec le token (une <img src=…> directe recevrait un 401).
  const [photo, setPhoto] = useState<File | null>(null);
  // Persistée en base : /users/me renvoie photo_file_path (source de vérité).
  const hasPhoto = !!me.data?.photo_file_path;
  const avatarUrl = useAuthedImage(hasPhoto ? "/users/me/photo" : null, hasPhoto ? 1 : 0);
  const upload = useMutation({
    mutationFn: (f: File) => userApi.uploadPhoto(f),
    onSuccess: () => {
      setPhoto(null);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me() });
      // Rafraîchit l'avatar partout (sidebar, topbar…) sans rechargement.
      qc.invalidateQueries({ queryKey: AVATAR_QUERY_KEY });
    },
  });

  // Édition de l'identité (nom, prénom, téléphone) — tout profil.
  const [editing, setEditing] = useState(false);
  const [identity, setIdentity] = useState({
    prenom: user?.prenom ?? "",
    nom: user?.nom ?? "",
    telephone: user?.telephone ?? "",
  });
  const [identSaved, setIdentSaved] = useState(false);
  const [identError, setIdentError] = useState<string | null>(null);
  const saveIdentity = useMutation({
    mutationFn: () =>
      userApi.updateMe({
        prenom: identity.prenom.trim(),
        nom: identity.nom.trim(),
        telephone: identity.telephone.trim() || undefined,
      }),
    onSuccess: () => {
      setUser({
        prenom: identity.prenom.trim(),
        nom: identity.nom.trim(),
        telephone: identity.telephone.trim() || undefined,
      });
      setEditing(false);
      setIdentSaved(true);
      setIdentError(null);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me() });
      window.setTimeout(() => setIdentSaved(false), 3000);
    },
    onError: (e) => setIdentError(apiErrorMessage(e, "Enregistrement impossible")),
  });

  return (
    <>
      <PageHeader title="Profil" subtitle={user?.email} />

      <div className="mx-auto w-full max-w-6xl md:px-8">
        {/* ── En-tête mobile ── */}
        <div className="flex items-center gap-4 px-5 pb-4 pt-5 md:hidden">
              <Avatar name={fullName} src={avatarUrl} size={64} />
          <div className="min-w-0">
            <div className="truncate text-lg font-extrabold text-ink">
              {fullName}
            </div>
            <div className="truncate text-[13px] font-medium text-ink-3">
              {user?.email}
            </div>
            {user?.telephone && (
              <div className="text-[13px] font-medium text-ink-3">
                {user.telephone}
              </div>
            )}
          </div>
        </div>

        {/* Photo de profil */}
        <div className="mx-4 mb-4 rounded-md bg-surface p-4 shadow-card md:mx-0 md:mt-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.06em] text-ink-3">
            Photo de profil
          </div>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt="Ma photo de profil"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <Avatar name={fullName} size={64} />
            )}
            <div className="min-w-0 flex-1">
              <PhotoUpload
                value={photo}
                onChange={setPhoto}
                label="Choisir une photo"
                hint="JPG / PNG · Max 8 Mo"
              />
              {photo && (
                <Button
                  size="sm"
                  loading={upload.isPending}
                  onClick={() => photo && upload.mutate(photo)}
                  className="mt-2"
                >
                  Enregistrer ma photo
                </Button>
              )}
              {upload.isError && (
                <p className="mt-1.5 text-xs font-semibold text-danger">
                  Envoi impossible.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mes informations — nom, prénom, téléphone (modifiables sur tout profil) */}
        <div className="mx-4 mb-4 rounded-md bg-surface p-4 shadow-card md:mx-0">
          <div className="flex items-center justify-between">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.06em] text-ink-3">
              Mes informations
            </div>
            {!editing && (
              <button
                onClick={() => {
                  setIdentity({
                    prenom: user?.prenom ?? "",
                    nom: user?.nom ?? "",
                    telephone: user?.telephone ?? "",
                  });
                  setEditing(true);
                }}
                className="flex items-center gap-1 text-[12px] font-bold text-primary"
              >
                <Pencil size={13} strokeWidth={2} /> Modifier
              </button>
            )}
          </div>

          {editing ? (
            <div className="mt-2 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-ink-2">Prénom</span>
                  <input
                    value={identity.prenom}
                    onChange={(e) =>
                      setIdentity((f) => ({ ...f, prenom: e.target.value }))
                    }
                    className="rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-2.5 text-[15px] text-ink outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-ink-2">Nom</span>
                  <input
                    value={identity.nom}
                    onChange={(e) =>
                      setIdentity((f) => ({ ...f, nom: e.target.value }))
                    }
                    className="rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-2.5 text-[15px] text-ink outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-ink-2">Téléphone</span>
                <input
                  value={identity.telephone}
                  onChange={(e) =>
                    setIdentity((f) => ({ ...f, telephone: e.target.value }))
                  }
                  placeholder="+225 …"
                  className="rounded-md border-[1.5px] border-border bg-surface-2 px-3 py-2.5 text-[15px] text-ink outline-none focus:border-primary"
                />
              </label>
              {identError && (
                <p className="text-xs font-semibold text-danger">{identError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  loading={saveIdentity.isPending}
                  disabled={!identity.prenom.trim() || !identity.nom.trim()}
                  onClick={() => saveIdentity.mutate()}
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-[14px] font-bold text-ink">
              {fullName}
              {user?.telephone && (
                <div className="mt-0.5 text-[13px] font-medium text-ink-3">
                  {user.telephone}
                </div>
              )}
              {identSaved && (
                <div className="mt-1 text-[12px] font-bold text-emerald">
                  Informations mises à jour ✓
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] md:gap-6 md:pt-6">
          {/* ── Colonne gauche : identité + villa + documents ── */}
          <div>
            {/* Carte identité desktop */}
            <div className="hidden items-center gap-4 rounded-md bg-surface p-6 shadow-card md:flex">
          <Avatar name={fullName} src={avatarUrl} size={64} />
              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold text-ink">
                  {fullName}
                </div>
                <div className="truncate text-[13px] font-medium text-ink-3">
                  {user?.email}
                </div>
                {user?.telephone && (
                  <div className="text-[13px] font-medium text-ink-3">
                    {user.telephone}
                  </div>
                )}
              </div>
            </div>

            {/* Ma villa */}
            <div className="mx-4 mb-4 rounded-md bg-surface p-4 shadow-card md:mx-0 md:mt-4">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.06em] text-ink-3">
                Ma villa
              </div>
              {me.isLoading ? (
                <Skeleton className="h-6 w-1/2" />
              ) : (
                <>
                  <div className="text-[15px] font-bold text-ink">
                    Villa {me.data?.villa?.numero ?? "—"}
                    {me.data?.villa?.rue ? `, ${me.data.villa.rue}` : ""}
                  </div>
                  {me.data?.cite && (
                    <div className="text-[13px] font-medium text-ink-3">
                      {me.data.cite.nom}
                    </div>
                  )}
                </>
              )}
              <Link
                href="/profil/colocations"
                className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-bold text-primary"
              >
                <LogIn size={14} strokeWidth={1.8} /> Rejoindre une autre cité
                <ChevronRight size={13} strokeWidth={1.7} />
              </Link>
            </div>

            {/* Documents */}
            <div className="mx-4 overflow-hidden rounded-md bg-surface shadow-card md:mx-0">
              <Link
                href="/profil/documents"
                className="flex items-center justify-between px-4 py-4"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-ink">
                  <FileText size={20} strokeWidth={1.7} className="text-primary" />
                  Documents
                </span>
                <ChevronRight size={18} strokeWidth={1.7} className="text-ink-3" />
              </Link>
            </div>

            {/* Colocations */}
            <div className="mx-4 mt-4 overflow-hidden rounded-md bg-surface shadow-card md:mx-0">
              <Link
                href="/profil/colocations"
                className="flex items-center justify-between px-4 py-4"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-ink">
                  <Users size={20} strokeWidth={1.7} className="text-primary" />
                  Colocations
                </span>
                <ChevronRight size={18} strokeWidth={1.7} className="text-ink-3" />
              </Link>
            </div>

            {/* Déconnexion */}
            <div className="px-4 pb-10 pt-6 md:px-0">
              <button
                onClick={() => {
                  logout();
                  router.replace("/login");
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-danger-soft py-3.5 text-sm font-bold text-danger md:w-auto md:px-6"
              >
                <LogOut size={18} strokeWidth={1.7} /> Se déconnecter
              </button>
            </div>
          </div>

          {/* ── Colonne droite : notifications ── */}
          <div>
            <div className="flex items-center justify-between px-5 pb-2 pt-5 md:px-0 md:pt-0">
              <h2 className="text-base font-extrabold tracking-[-.3px] text-ink md:text-[15px]">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={readAll}
                  className="text-[13px] font-semibold text-primary"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 px-4 md:px-0">
              {notifs.length === 0 ? (
                <p className="text-[13px] font-medium text-ink-3">
                  Aucune notification.
                </p>
              ) : (
                notifs.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.lu && markRead(n.id)}
                    className={cn(
                      "rounded-md bg-surface p-3.5 text-left shadow-card",
                      !n.lu && "border-l-4 border-primary",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.lu && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-danger" />
                      )}
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-ink">
                          {n.titre}
                        </div>
                        {n.message && (
                          <div className="mt-0.5 text-xs font-medium text-ink-2">
                            {n.message}
                          </div>
                        )}
                        <div className="mt-1 text-[11px] font-medium text-ink-3">
                          {formatRelative(n.created_at ?? "")}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
