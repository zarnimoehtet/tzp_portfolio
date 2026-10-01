import Link from "next/link";
import { Camera, Images, Inbox, Package } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export default async function DashboardPage() {
  const { totals, recentInquiries, recentPhotos } = await getDashboardStats();

  const stats = [
    { label: "Photos", value: totals.photos, icon: Camera, href: "/admin/photos" },
    { label: "Albums", value: totals.albums, icon: Images, href: "/admin/albums" },
    { label: "Packages", value: totals.packages, icon: Package, href: "/admin/packages" },
    { label: "New inquiries", value: totals.newInquiries, icon: Inbox, href: "/admin/inquiries" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="An overview of your portfolio."
        actions={
          <Link href="/admin/photos" className={buttonVariants()}>
            Upload photos
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tabular-nums">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent inquiries</CardTitle>
            <Link href="/admin/inquiries" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentInquiries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inquiries yet.</p>
            ) : (
              <ul className="divide-y">
                {recentInquiries.map((inquiry) => (
                  <li key={inquiry.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-medium">
                        {inquiry.name}
                        {inquiry.status === "new" && <Badge>New</Badge>}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{inquiry.message}</p>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground" dateTime={inquiry.created_at}>
                      {formatDate(inquiry.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent uploads</CardTitle>
            <Link href="/admin/photos" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Manage
            </Link>
          </CardHeader>
          <CardContent>
            {recentPhotos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos uploaded yet.</p>
            ) : (
              <ul className="grid grid-cols-3 gap-2">
                {recentPhotos.map((photo) => (
                  <li key={photo.id} className="aspect-square overflow-hidden rounded-md bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbnail_url}
                      alt={photo.alt_text ?? photo.title ?? ""}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
