import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Settings,
  Activity,
  type LucideIcon,
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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { UiSidebarItem } from "@/lib/dashboard-view";

const defaultItems: { title: string; url: string; icon: LucideIcon }[] = [
  { title: "Visão Geral", url: "/", icon: LayoutDashboard },
  { title: "Wagoo", url: "/wagoo", icon: Boxes },
  { title: "2AVENDAS", url: "/avendas", icon: ShoppingCart },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

function iconFromHint(hint?: string): LucideIcon {
  const h = (hint ?? "").toLowerCase();
  if (h.includes("wagoo") || h.includes("box")) return Boxes;
  if (h.includes("vend") || h.includes("cart") || h.includes("shop")) return ShoppingCart;
  if (h.includes("setting") || h.includes("config")) return Settings;
  if (h.includes("dash") || h.includes("home")) return LayoutDashboard;
  return LayoutDashboard;
}

function mapDynamic(items: UiSidebarItem[]): { title: string; url: string; icon: LucideIcon }[] {
  return items.map((it) => ({
    title: it.label,
    url: it.href.startsWith("/") ? it.href : `/${it.href}`,
    icon: iconFromHint(it.icon),
  }));
}

type Props = {
  dynamicItems?: UiSidebarItem[];
};

export function AppSidebar({ dynamicItems }: Props) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = dynamicItems?.length ? mapDynamic(dynamicItems) : defaultItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center border border-primary/60 bg-background neon-border">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-mono text-sm font-semibold tracking-widest text-foreground">
              KORVEN
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Lab // Console
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.25em]">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.url;
                return (
                  <SidebarMenuItem key={`${item.url}-${item.title}`}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="font-mono text-xs uppercase tracking-wider">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-data-[collapsible=icon]:hidden">
          <span className="h-1.5 w-1.5 animate-pulse bg-primary" />
          system online
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
