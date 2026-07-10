import { Outlet, Link, useLocation } from "react-router-dom";
import { Users, LogOut, HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const navItems = [
  { path: "/roster", label: "My Players", icon: Users },
];

export default function CoachLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/roster" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">U</span>
            </div>
            <div>
              <span className="text-white font-display font-bold text-lg tracking-tight">Under Par Mindset</span>
              <span className="ml-2 text-xs font-normal text-primary-foreground/60 uppercase tracking-widest">
                {user?.user_type === "coach" ? "Coach" : "Parent"} View
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              to="/support"
              className="p-2 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors"
              title="Support"
            >
              <HelpCircle className="w-5 h-5" />
            </Link>
            <Link
              to="/settings"
              className="p-2 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-1.5 text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 hidden md:flex gap-1 pb-1">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium transition-all",
                  active
                    ? "bg-background text-primary"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}