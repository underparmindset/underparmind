import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  LifeBuoy,
  Send,
  Loader2,
  Flag,
  Dumbbell,
  Target,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

const FAQS = [
  {
    q: "How do I get started?",
    a: "Start each morning with Win The Day to set your focus, then log your rounds after playing. Explore the Mental Gym for weekly mental training modules, set your Goals, and use the Journal to reflect. Complete your profile in Settings to personalize your experience.",
  },
  {
    q: "How do I invite my coach or parent?",
    a: "Go to the Invite page from your dashboard. Enter their email and select Coach or Parent. They'll receive an invitation and, once they set up their account, they'll automatically be able to view your performance data.",
  },
  {
    q: "How does the Mental Gym work?",
    a: "The Mental Gym is a 52-week sequential training program with 5 daily modules per week, each focused on a different mental game area. Complete all 5 days to unlock the next week. Earn badges for daily streaks and weekly completions.",
  },
  {
    q: "How do I earn badges?",
    a: "Two ways: Daily Streak badges for completing modules on consecutive days (3, 5, 10, 21, and 30-day milestones), and Weekly Completion badges for finishing full weeks (1, 4, 13, 26, and 52 weeks). Check the badges section at the bottom of the Mental Gym page.",
  },
  {
    q: "What is Win The Day?",
    a: "Win The Day is your daily mental focus routine. Write affirmations, gratitude, and your 'why I will win' statement, then set focus tasks for the round. It takes 2-3 minutes and sets your mindset for success.",
  },
  {
    q: "How do I log a round?",
    a: "Go to Log Round from your dashboard. Enter the course, date, and round type. You can track hole-by-hole scores, fairways hit, greens in regulation, and putts, plus rate your mental performance. Your dashboard stats update automatically.",
  },
  {
    q: "How do I cancel or change my subscription?",
    a: "Subscription management is coming soon. For now, send us a message using the form below with the subject 'Billing' and we'll help you cancel, change plans, or issue a refund right away.",
  },
  {
    q: "How do I change my password?",
    a: "Go to Settings → Security and click 'Reset Password.' You'll receive an email with a link to set a new password. Check your spam folder if you don't see it within a few minutes.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your rounds, journal entries, goals, and mental gym progress are private to you. Only coaches and parents you've explicitly invited through the Invite page can view your performance data.",
  },
];

const QUICK_LINKS = [
  { to: "/log-round", label: "Log a Round", desc: "Track scores & stats", icon: Flag },
  { to: "/mental-gym", label: "Mental Gym", desc: "Weekly training", icon: Dumbbell },
  { to: "/focus", label: "Win The Day", desc: "Daily focus routine", icon: Target },
  { to: "/invite", label: "Invite Coach", desc: "Share your progress", icon: UserPlus },
];

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "billing", label: "Billing & Subscriptions" },
  { value: "technical", label: "Technical Issue" },
  { value: "account", label: "Account Access" },
  { value: "feature_request", label: "Feature Request" },
];

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.SupportTicket.create({
        subject: subject.trim(),
        message: message.trim(),
        category,
        user_email: user?.email || "",
        user_name: user?.first_name || "",
      });

      if (user?.email) {
        try {
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: `Support Request Received: ${subject}`,
            body: `Hi ${user.first_name || "there"},\n\nWe've received your support request and our team will get back to you soon.\n\nSubject: ${subject}\nCategory: ${CATEGORIES.find((c) => c.value === category)?.label}\n\nMessage:\n${message}\n\nThanks for reaching out!\nThe Under Par Mindset Team`,
          });
        } catch (e) {
          // Non-critical — ticket is still saved in the database
        }
      }

      setSubmitted(true);
      setSubject("");
      setMessage("");
      setCategory("general");
      toast.success("Support request submitted!");
    } catch (err) {
      toast.error(err.message || "Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-primary-foreground/80 hover:text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm">U</span>
          </div>
          <span className="text-white font-display font-bold text-lg">Support</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24 space-y-8">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <LifeBuoy className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold">How can we help?</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Find quick answers below or send us a message — we typically respond within 24 hours.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <p className="font-semibold text-sm">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
              </Link>
            );
          })}
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-display font-bold text-lg mb-3">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="bg-card rounded-xl border border-border">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className={i < FAQS.length - 1 ? "border-b border-border" : "border-b-0"}
              >
                <AccordionTrigger className="px-4 text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-muted-foreground text-sm leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="font-display font-bold text-lg mb-1">Still need help?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send us a message and we'll get back to you by email.
          </p>

          {submitted ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-display font-bold text-lg">Request submitted!</p>
              <p className="text-sm text-muted-foreground mt-1">
                We've received your message and sent a confirmation to your email. Our team will
                respond within 24 hours.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
                Send another message
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-xl border border-border p-5 space-y-4"
            >
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your question"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's going on..."
                  className="min-h-[120px]"
                  required
                />
              </div>
              {user?.email && (
                <p className="text-xs text-muted-foreground">
                  We'll respond to:{" "}
                  <span className="font-medium text-foreground">{user.email}</span>
                </p>
              )}
              <Button type="submit" disabled={submitting} className="w-full gap-2">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}