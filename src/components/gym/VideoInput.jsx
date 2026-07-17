import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  // Vimeo
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function isDirectVideo(url) {
  if (!url) return false;
  return /\.(mp4|mov|webm|ogg|m4v)(\?|$)/i.test(url);
}

export default function VideoInput({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch {
      // let it bubble via toast in parent if needed
    }
    setUploading(false);
  };

  const clear = () => {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* URL input */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste YouTube, Vimeo, or direct video URL"
        />
        {value && (
          <button type="button" onClick={clear} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or upload a file</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Upload dropzone */}
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
      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/mov,video/webm,video/quicktime"
        onChange={handleFile}
        className="hidden"
      />

      {value && (
        <div className="space-y-2">
          {/* Video preview */}
          {getEmbedUrl(value) ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={getEmbedUrl(value)}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video preview"
              />
            </div>
          ) : isDirectVideo(value) ? (
            <div className="rounded-lg overflow-hidden bg-black">
              <video src={value} controls className="w-full max-h-64" />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2 text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg">
            <span className="truncate flex-1">✓ Video added</span>
            <button type="button" onClick={clear} className="flex items-center gap-1 text-muted-foreground hover:text-destructive shrink-0">
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}