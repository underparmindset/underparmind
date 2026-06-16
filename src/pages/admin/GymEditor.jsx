import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Mindset", "Routine", "Focus", "Resilience", "Confidence", "Course Management"];

const EMPTY_FORM = {
  title: "",
  summary: "",
  content: "",
  category: "",
  week_label: "",
  is_featured: false,
  order: 0,
};

export default function GymEditor() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null); // null = closed, "new" = new, id = editing existing
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ["gymModules"],
    queryFn: () => base44.entities.GymModule.list("order", 100),
  });

  const openNew = () => {
    setForm({ ...EMPTY_FORM, order: modules.length + 1 });
    setEditing("new");
  };

  const openEdit = (mod) => {
    setForm({
      title: mod.title || "",
      summary: mod.summary || "",
      content: mod.content || "",
      category: mod.category || "",
      week_label: mod.week_label || "",
      is_featured: mod.is_featured || false,
      order: mod.order || 0,
    });
    setEditing(mod.id);
  };

  const handleSave = async () => {
    if (!form.title || !form.summary || !form.content) {
      toast.error("Title, summary, and content are required.");
      return;
    }
    setSaving(true);
    if (editing === "new") {
      await base44.entities.GymModule.create(form);
      toast.success("Module created!");
    } else {
      await base44.entities.GymModule.update(editing, form);
      toast.success("Module updated!");
    }
    queryClient.invalidateQueries({ queryKey: ["gymModules"] });
    setEditing(null);
    setSaving(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Mental Gym Editor</h1>
          <p className="text-muted-foreground text-sm mt-1">Add and manage weekly training modules for your players</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Module
        </Button>
      </div>

      {/* Form panel */}
      {editing && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">{editing === "new" ? "New Module" : "Edit Module"}</h2>
            <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Bounce-Back Mastery" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Summary *</label>
              <Input value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="One-line description shown on the card" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— None —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Week Label</label>
              <Input value={form.week_label} onChange={e => setForm(f => ({ ...f, week_label: e.target.value }))} placeholder="e.g. Week of Jun 16" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Display Order</label>
              <Input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                  form.is_featured ? "bg-accent/15 border-accent/50 text-accent" : "border-border text-muted-foreground hover:border-accent/50"
                )}
              >
                <Star className="w-4 h-4" /> {form.is_featured ? "Featured (This Week)" : "Mark as Featured"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Content * (Markdown supported)</label>
            <Textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={"Write the module content here...\n\nYou can use **bold**, bullet lists, numbered steps, etc."}
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Supports **bold**, *italic*, bullet lists (- item), numbered lists (1. item)</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Module"}
            </Button>
          </div>
        </div>
      )}

      {/* Module list */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : modules.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
          <p className="font-semibold">No modules yet</p>
          <p className="text-sm mt-1">Click "Add Module" to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...modules].sort((a, b) => (a.order || 0) - (b.order || 0)).map(mod => (
            <div key={mod.id} className={cn(
              "bg-card border rounded-xl p-4 flex items-start gap-3",
              mod.is_featured ? "border-accent/40" : "border-border"
            )}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-sm">{mod.title}</span>
                  {mod.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent flex items-center gap-1">
                      <Star className="w-3 h-3" /> Featured
                    </span>
                  )}
                  {mod.week_label && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-secondary-foreground">{mod.week_label}</span>
                  )}
                  {mod.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">{mod.category}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{mod.summary}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleFeatured(mod)}
                  title={mod.is_featured ? "Unfeature" : "Feature this week"}
                  className={cn("p-1.5 rounded-lg hover:bg-accent/10 transition-colors", mod.is_featured ? "text-accent" : "text-muted-foreground")}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button onClick={() => openEdit(mod)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(mod.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}