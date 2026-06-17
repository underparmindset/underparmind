import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Link, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VideoInput({ value, onChange }) {
  const [mode, setMode] = useState(value && !value.startsWith("http") ? "upload" : value ? "url" : "url");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setUploading(false);
  };

  const clear = () => {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {/* Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden w-fit text-xs font-medium">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={cn("px-3 py-1.5 flex items-center gap-1.5 transition-colors", mode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
        >
          <Link className="w-3 h-3" /> Paste URL
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={cn("px-3 py-1.5 flex items-center gap-1.5 transition-colors", mode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
        >
          <Upload className="w-3 h-3" /> Upload File
        </button>
      </div>

      {mode === "url" ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=...  or  https://vimeo.com/..."
          />
          {value && <button type="button" onClick={clear} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            onClick={() => !uploading && fileRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload an MP4 or MOV file</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="video/mp4,video/mov,video/webm,video/quicktime" onChange={handleFile} className="hidden" />
          {value && (
            <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg">
              <span className="truncate flex-1">✓ Video uploaded</span>
              <button type="button" onClick={clear} className="text-muted-foreground hover:text-destructive shrink-0"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      )}

      {value && mode === "url" && (
        <p className="text-xs text-muted-foreground">YouTube, Vimeo, or direct video file URL</p>
      )}
    </div>
  );
}