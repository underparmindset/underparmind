import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="font-display font-bold text-lg mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}

export default function LegalLayout({ title, icon: Icon, lastUpdated, children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="p-2 -ml-2 text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="text-primary font-heading font-bold text-sm">UP</span>
          </div>
          <span className="text-lg tracking-tight flex items-baseline gap-1.5">
            <span className="font-logo-primary font-extralight text-primary-foreground">Under Par</span>
            <span className="font-logo-secondary font-light text-accent">Mindset</span>
          </span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>
        <div className="space-y-6">{children}</div>
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Questions?{" "}
            <Link to="/support" className="text-primary font-medium hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}