import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Table as TableIcon, ShieldCheck, Activity, 
  AlertTriangle, Target, Map, Settings 
} from "lucide-react";
import React from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matriz", label: "Matriz de Riesgos", icon: TableIcon },
  { href: "/controles", label: "Catálogo de Controles", icon: ShieldCheck },
  { href: "/monitoreo", label: "Plan de Monitoreo", icon: Activity },
  { href: "/eventos", label: "Eventos", icon: AlertTriangle },
  { href: "/mediciones", label: "Mediciones", icon: Target },
  { href: "/mapa-calor", label: "Mapa de Calor", icon: Map },
  { href: "/parametros", label: "Parámetros", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <aside className="w-64 flex-shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              MR
            </div>
            <span className="font-semibold text-lg tracking-tight">Matriz LAFT</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border shrink-0 text-xs text-sidebar-foreground/50">
          Matriz de Riesgos LAFT v1.0
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
        {children}
      </main>
    </div>
  );
}
