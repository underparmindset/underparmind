import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Video, Check, Loader2, AlertCircle, ArrowLeft, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function Booking() {
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutSuccess = urlParams.get("checkout") === "success";
  const sessionId = urlParams.get("session_id");
  const tier = urlParams.get("tier") || "Coaching Session";

  const [availability, setAvailability] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!checkoutSuccess) {
      setLoadingSlots(false);
      return;
    }
    base44.functions.invoke("getCalendarAvailability", {})
      .then((res) => setAvailability(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message || "Failed to load availability"))
      .finally(() => setLoadingSlots(false));
  }, [checkoutSuccess]);

  const handleBook = async () => {
    if (!selectedSlot || !name.trim() || !email.trim()) return;
    setBooking(true);
    setError("");
    try {
      const res = await base44.functions.invoke("bookCoachingSession", {
        session_id: sessionId,
        slot_start: selectedSlot.start,
        slot_end: selectedSlot.end,
        name: name.trim(),
        email: email.trim(),
        tier,
      });
      setConfirmation(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to book session");
    } finally {
      setBooking(false);
    }
  };

  const copyLink = () => {
    if (confirmation?.meet_link) {
      navigator.clipboard.writeText(confirmation.meet_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Not from checkout — show pay first message
  if (!checkoutSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-2">Book Your Session</h1>
        <p className="text-muted-foreground text-sm mb-6">
          You need to complete payment for a coaching session before you can book a time slot.
        </p>
        <Link to="/coaching">
          <Button className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Coaching
          </Button>
        </Link>
      </div>
    );
  }

  // Confirmation screen
  if (confirmation) {
    const startDate = new Date(confirmation.start);
    return (
      <div className="max-w-md mx-auto py-8">
        <div className="bg-card rounded-xl border border-primary/20 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-1">Session Booked!</h1>
          <p className="text-muted-foreground text-sm mb-5">
            A calendar invite with the Google Meet link has been sent to your email.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">
                  {startDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })} ({confirmation.timezone})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Video className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Google Meet</p>
                <div className="flex items-center gap-2">
                  <a href={confirmation.meet_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate flex-1">
                    {confirmation.meet_link}
                  </a>
                  <button onClick={copyLink} className="text-muted-foreground hover:text-primary flex-shrink-0">
                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" className="mt-5">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loadingSlots) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Error loading availability
  if (error && !availability) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-display font-bold mb-2">Couldn't Load Availability</h1>
        <p className="text-muted-foreground text-sm mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    );
  }

  const dates = availability?.dates || [];
  const selectedDate = dates[selectedDateIdx];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Book Your Coaching Session</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {tier} · 60 minutes · <span className="text-primary font-medium">Payment confirmed ✓</span>
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {dates.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            No available slots in the next two weeks. Please check back soon.
          </p>
        </div>
      ) : (
        <>
          {/* Date selector */}
          <div>
            <h2 className="font-display font-bold text-lg mb-3">Select a Date</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {dates.map((d, idx) => (
                <button
                  key={d.date}
                  onClick={() => { setSelectedDateIdx(idx); setSelectedSlot(null); }}
                  className={cn(
                    "flex-shrink-0 w-20 py-3 rounded-xl border text-center transition-colors",
                    selectedDateIdx === idx
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/40"
                  )}
                >
                  <p className="text-xs font-semibold uppercase">{d.weekday}</p>
                  <p className="text-sm font-bold mt-0.5">{d.dayLabel}</p>
                  <p className={cn("text-[10px] mt-1", selectedDateIdx === idx ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {d.slots.length} slots
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <h2 className="font-display font-bold text-lg mb-3">Available Times</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {selectedDate.slots.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      "py-2.5 rounded-lg border text-sm font-medium transition-colors",
                      selectedSlot?.start === slot.start
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/40"
                    )}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contact info */}
          {selectedSlot && (
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="font-display font-bold text-lg">Your Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                </div>
              </div>
              <Button
                onClick={handleBook}
                disabled={!name.trim() || !email.trim() || booking}
                className="w-full h-11 bg-primary hover:bg-primary/90"
              >
                {booking ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</>
                ) : (
                  <><Check className="w-4 h-4 mr-1.5" /> Confirm Booking</>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}