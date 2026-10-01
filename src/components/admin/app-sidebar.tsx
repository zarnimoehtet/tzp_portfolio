"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Camera,
  ExternalLink,
  FileText,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  MessageSquareQuote,
  Package,
  Phone,
  Settings,
  UserRound,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { logout } from "@/lib/actions/auth";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/photos", label: "Photos", icon: Camera },
      { href: "/admin/albums", label: "Albums", icon: Images },
      { href: "/admin/packages", label: "Packages", icon: Package },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/about", label: "About", icon: UserRound },
      { href: "/admin/contact", label: "Contact", icon: Phone },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  siteName: string;
  email: string;
  newInquiries: number;
}

export function AppSidebar({ siteName, email, newInquiries }: AppSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <FileText className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{siteName}</span>
                <span className="truncate text-xs text-muted-foreground">Studio admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV.map((group, i) => (
          <SidebarGroup key={group.label ?? i}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.href === "/admin/inquiries" && newInquiries > 0 && (
                      <SidebarMenuBadge>{newInquiries}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="View website"
              render={<a href="/" target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink />
              <span>View website</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <form action={logout}>
              <SidebarMenuButton type="submit" tooltip="Log out">
                <LogOut />
                <span className="truncate">Log out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
        <p className="truncate px-2 pb-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          {email}
        </p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
