import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Target, Flag, BookOpen, Dumbbell, PenLine, MessageSquare, UserPlus, HelpCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/focus", label: "Win The Day", icon: Target },
  { path: "/log-round", label: "Log Round", icon: Flag },
  { path: "/goals", label: "Goals", icon: BookOpen },
  { path: "/mental-gym", label: "Mental Gym", icon: Dumbbell },
  { path: "/journal", label: "Journal", icon: PenLine },
  { path: "/coaching", label: "Coaching", icon: MessageSquare },
  { path: "/invite", label: "Invite", icon: UserPlus },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="bg-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">U</span>
            </div>
            <span className="text-white font-display font-bold text-lg tracking-tight">Under Par Mindset</span>
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
          </div>
        </div>
        {/* Desktop nav */}
        <nav className="max-w-7xl mx-auto px-4 hidden md:flex gap-1 pb-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}