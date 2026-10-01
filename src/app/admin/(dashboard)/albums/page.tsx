import type { Metadata } from "next";

import { getAdminAlbums } from "@/lib/data/admin";
import { AlbumManager } from "./album-manager";

export const metadata: Metadata = { title: "Albums" };

export default async function AlbumsPage() {
  const albums = await getAdminAlbums();
  return <AlbumManager albums={albums} />;
}
