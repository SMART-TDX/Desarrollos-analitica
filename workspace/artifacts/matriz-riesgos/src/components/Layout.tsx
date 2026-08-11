import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Table as TableIcon, ShieldCheck, Activity, 
  AlertTriangle, Target, Map, Settings, Menu, X 
} from "lucide-react";
import React, { useState } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Panel Lateral (Sidebar) con Fondo Rojo #c91212 */}
      <aside
        style={{ backgroundColor: "#c91212" }}
        className={`${
          sidebarOpen ? "w-64" : "w-0 hidden opacity-0"
        } transition-all duration-300 flex-shrink-0 border-r border-red-900 text-white flex flex-col overflow-hidden shadow-lg`}
      >
        {/* Encabezado Sidebar */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-red-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white text-[#c91212] font-extrabold flex items-center justify-center text-base shadow-sm">
              M
            </div>
            <span className="font-bold text-base tracking-tight text-white whitespace-nowrap">
              Matriz de Riesgos
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/80 hover:text-white p-1 rounded hover:bg-red-800/60 transition-colors"
            title="Ocultar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                style={isActive ? { backgroundColor: "#8c0b0b", color: "#ffffff" } : {}}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-semibold whitespace-nowrap ${
                  isActive 
                    ? "shadow-inner border border-red-900/40" 
                    : "text-white/90 hover:bg-red-800/60 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-red-800/80 shrink-0 text-xs text-white/70 whitespace-nowrap">
          Matriz de Riesgos SAGRILAFT
        </div>
      </aside>

      {/* Área Principal */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden h-screen">
        {/* Barra superior con botón de 3 rayitas (Menu) */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 shrink-0 gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md border border-input hover:bg-muted text-foreground transition-colors flex items-center justify-center"
            title={sidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-sm text-muted-foreground">
            {sidebarOpen ? "Panel Principal" : "Vista Completa (Menú Oculto)"}
          </span>
        </header>

        {/* Contenido con scroll habilitado */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}