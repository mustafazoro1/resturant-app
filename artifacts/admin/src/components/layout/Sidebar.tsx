import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  ReceiptText,
  BarChart3,
  LogOut,
  Tag,
  Truck,
  Settings2,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Live Orders", icon: ReceiptText },
  { href: "/menu", label: "Menu Management", icon: MenuIcon },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/delivery", label: "Delivery & Branches", icon: Truck },
  { href: "/banners", label: "Banner Management", icon: Monitor },
  { href: "/settings", label: "Settings", icon: Settings2 },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col w-64 border-r bg-sidebar text-sidebar-foreground h-screen sticky top-0 shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-destructive text-destructive-foreground p-2 rounded-md font-bold text-xl leading-none">
            RFC
          </div>
          <div>
            <h2 className="font-bold tracking-tight text-lg leading-tight">
              Admin
            </h2>
            <p className="text-xs text-sidebar-foreground/60 font-medium">
              Operations Center
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="text-xs font-semibold text-sidebar-foreground/50 mb-4 px-3 uppercase tracking-wider">
          Overview
        </div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground gap-3"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
