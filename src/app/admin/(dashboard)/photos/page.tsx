import type { Metadata } from "next";

import { PageHeader } from "@/components/admin/page-header";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { getAdminAlbums, getAdminPhotos } from "@/lib/data/admin";
import { PhotoManager } from "./photo-manager";

export const metadata: Metadata = { title: "Photos" };

export default async function PhotosPage({ searchParams }: PageProps<"/admin/photos">) {
  const { album } = await searchParams;
  const albums = await getAdminAlbums();
  const filter =
    album === "unassigned"
      ? "unassigned"
      : albums.find((a) => a.id === album)?.id;
  const photos = await getAdminPhotos({ albumId: filter });
  const currentAlbum = albums.find((a) => a.id === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Photos"
        description="Upload, organize and publish your photographs."
      />
      <PhotoUploader
        key={filter ?? "all"}
        albumId={currentAlbum?.id ?? null}
        albumName={currentAlbum?.name}
      />
      <PhotoManager
        photos={photos}
        albums={albums.map((a) => ({ id: a.id, name: a.name, cover_photo_id: a.cover_photo_id }))}
        filter={filter ?? "all"}
      />
    </div>
  );
}
