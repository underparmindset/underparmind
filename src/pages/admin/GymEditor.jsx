import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Star, X, Check, Link2, Video, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import VideoInput from "@/components/gym/VideoInput";
import ModuleRow from "@/components/gym/ModuleRow";
import { DAY_SCHEDULE, TOTAL_WEEKS } from "@/lib/gymConfig";

const SOCIAL_PLATFORMS = ["Instagram", "TikTok", "YouTube", "X", "Facebook", "LinkedIn"];

const EMPTY_FORM = {
  title: "",
  summary: "",
  content: "",
  week_number: 1,
  day_number: 1,
  category: "Mindset",
  week_label: "Week 1",
  is_featured: false,
  order: 11,
  video_url: "",
  article_url: "",
  article_title: "",
  social_links: [],
};

export default function GymEditor() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(null); // null | "new" | module_id
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u?.role !== "admin") navigate("/");
    });
  }, []);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["gymModules"],
    queryFn: () => base44.entities.GymModule.list("order", 500),
  });

  // Group modules by week -> { day -> module }
  const weeksMap = new Map();
  const unassigned = [];
  modules.forEach((m) => {
    if (!m.week_number) {
      unassigned.push(m);
      return;
    }
    if (!weeksMap.has(m.week_number)) weeksMap.set(m.week_number, {});
    weeksMap.get(m.week_number)[m.day_number] = m;
  });

  const weekNumbers = [...weeksMap.keys()].sort((a, b) => a - b);
  const maxWeek = weekNumbers.length > 0 ? Math.max(...weekNumbers) : 0;
  const weeksToShow = Array.from(
    { length: Math.min(maxWeek + 1, TOTAL_WEEKS) },
    (_, i) => i + 1
  );

  const openNew = (weekNum, dayNum) => {
    const dayInfo = DAY_SCHEDULE.find((d) => d.day === dayNum);
    setForm({
      ...EMPTY_FORM,
      week_number: weekNum,
      day_number: dayNum,
      category: dayInfo?.category || "Mindset",
      week_label: `Week ${weekNum}`,
      order: weekNum * 10 + dayNum,
    });
    setEditing("new");
  };

  const openEdit = (mod) => {
    setForm({
      title: mod.title || "",
      summary: mod.summary || "",
      content: mod.content || "",
      week_number: mod.week_number || 1,
      day_number: mod.day_number || 1,
      category: mod.category || "",
      week_label: mod.week_label || "",
      is_featured: mod.is_featured || false,
      order: mod.order || 0,
      video_url: mod.video_url || "",
      article_url: mod.article_url || "",
      article_title: mod.article_title || "",
      social_links: mod.social_links || [],
    });
    setEditing(mod.id);
  };

  const addSocialLink = () => {
    setForm((f) => ({
      ...f,
      social_links: [...(f.social_links || []), { platform: "Instagram", url: "", label: "" }],
    }));
  };

  const updateSocialLink = (i, field, value) => {
    setForm((f) => {
      const links = [...(f.social_links || [])];
      links[i] = { ...links[i], [field]: value };
      return { ...f, social_links: links };
    });
  };

  const removeSocialLink = (i) => {
    setForm((f) => ({
      ...f,
      social_links: (f.social_links || []).filter((_, idx) => idx !== i),
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.summary || !form.content) {
      toast.error("Title, summary, and content are required.");
      return;
    }
    setSaving(true);
    const dayInfo = DAY_SCHEDULE.find((d) => d.day === form.day_number);
    const payload = {
      ...form,
      category: dayInfo?.category || form.category,
      order: form.week_number * 10 + form.day_number,
      week_label: `Week ${form.week_number}`,
    };
    try {
      if (editing === "new") {
        await base44.entities.GymModule.create(payload);
        toast.success("Module created!");
      } else {
        await base44.entities.GymModule.update(editing, payload);
        toast.success("Module updated!");
      }
      queryClient.invalidateQueries({ queryKey: ["gymModules"] });
      setEditing(null);
    } catch (err) {
      toast.error(err.message || "Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this module?")) return;
    await base44.entities.GymModule.delete(id);
    queryClient.invalidateQueries({ queryKey: ["gymModules"] });
    toast.success("Module deleted.");
  };

  const toggleFeatured = async (mod) => {
    await base44.entities.GymModule.update(mod.id, { is_featured: !mod.is_featured });
    queryClient.invalidateQueries({ queryKey: ["gymModules"] });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Mental Gym Editor</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create weekly training content — 5 days per week, each focused on a different mental game area
        </p>
      </div>

      {/* ── Form panel ── */}
      {editing && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">
              {editing === "new"
                ? `New Module — Week ${form.week_number}, Day ${form.day_number}`
                : "Edit Module"}
            </h2>
            <button onClick={() => setEditing(null)}>
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {/* Week & Day selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Week</label>
              <select
                value={form.week_number}
                onChange={(e) => setForm((f) => ({ ...f, week_number: Number(e.target.value) }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Day</label>
              <select
                value={form.day_number}
                onChange={(e) => {
                  const dayNum = Number(e.target.value);
                  const dayInfo = DAY_SCHEDULE.find((d) => d.day === dayNum);
                  setForm((f) => ({
                    ...f,
                    day_number: dayNum,
                    category: dayInfo?.category || f.category,
                  }));
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {DAY_SCHEDULE.map((d) => (
                  <option key={d.day} value={d.day}>
                    Day {d.day} — {d.label} ({d.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Bounce-Back Mastery"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Summary *</label>
            <Input
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              placeholder="One-line description shown on the card"
            />
          </div>

          {/* ── Media section ── */}
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/40 px-4 py-2.5 border-b border-border">
              <p className="text-sm font-semibold text-foreground">
                Media &amp; Links <span className="text-xs font-normal text-muted-foreground ml-1">— all optional</span>
              </p>
            </div>

            <div className="p-4 space-y-2 border-b border-border">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" /> Video
              </label>
              <VideoInput
                value={form.video_url}
                onChange={(url) => setForm((f) => ({ ...f, video_url: url }))}
              />
            </div>

            <div className="p-4 space-y-2 border-b border-border">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Article Link
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={form.article_url}
                  onChange={(e) => setForm((f) => ({ ...f, article_url: e.target.value }))}
                  placeholder="https://example.com/article"
                />
                <Input
                  value={form.article_title}
                  onChange={(e) => setForm((f) => ({ ...f, article_title: e.target.value }))}
                  placeholder="Display title (optional)"
                />
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Social Media Links
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={addSocialLink} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Link
                </Button>
              </div>
              {(form.social_links || []).length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No social links yet — add Instagram, TikTok, YouTube posts etc.
                </p>
              )}
              {(form.social_links || []).map((link, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
                    className="flex h-9 w-32 shrink-0 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={link.url}
                    onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                    placeholder="URL"
                    className="flex-1"
                  />
                  <Input
                    value={link.label}
                    onChange={(e) => updateSocialLink(i, "label", e.target.value)}
                    placeholder="Label"
                    className="w-28 shrink-0"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(i)}
                    className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Content * (Markdown supported)</label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder={"Write the module content here...\n\nYou can use **bold**, bullet lists, numbered steps, etc."}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_featured: !f.is_featured }))}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                form.is_featured
                  ? "bg-accent/15 border-accent/50 text-accent"
                  : "border-border text-muted-foreground hover:border-accent/50"
              )}
            >
              <Star className="w-4 h-4" /> {form.is_featured ? "Featured" : "Mark as Featured"}
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Module"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Module list grouped by week ── */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="space-y-4">
          {/* Unassigned legacy modules */}
          {unassigned.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Unassigned Modules
              </p>
              {unassigned.map((mod) => (
                <ModuleRow
                  key={mod.id}
                  mod={mod}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onToggleFeatured={toggleFeatured}
                />
              ))}
            </div>
          )}

          {/* Weeks */}
          {weeksToShow.map((weekNum) => {
            const weekData = weeksMap.get(weekNum) || {};
            return (
              <div
                key={weekNum}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <div className="bg-muted/40 px-4 py-2.5 border-b border-border">
                  <p className="font-display font-bold text-sm">Week {weekNum}</p>
                </div>
                <div className="p-3 space-y-2">
                  {DAY_SCHEDULE.map((dayInfo) => {
                    const mod = weekData[dayInfo.day];
                    if (mod) {
                      return (
                        <ModuleRow
                          key={dayInfo.day}
                          mod={mod}
                          dayInfo={dayInfo}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          onToggleFeatured={toggleFeatured}
                        />
                      );
                    }
                    return (
                      <button
                        key={dayInfo.day}
                        onClick={() => openNew(weekNum, dayInfo.day)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Day {dayInfo.day} — {dayInfo.label}
                          </p>
                          <p className="text-xs text-muted-foreground/70">{dayInfo.category}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Add next week */}
          {maxWeek < TOTAL_WEEKS && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => openNew(maxWeek + 1, 1)}
            >
              <Plus className="w-4 h-4 mr-2" /> Start Week {maxWeek + 1}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}