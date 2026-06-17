import { ExternalLink, Instagram, Youtube, Twitter } from "lucide-react";

const PLATFORM_ICONS = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: null,
  x: Twitter,
  twitter: Twitter,
};

const PLATFORM_COLORS = {
  instagram: "text-pink-500",
  youtube: "text-red-500",
  tiktok: "text-foreground",
  x: "text-foreground",
  twitter: "text-sky-500",
};

function getEmbedUrl(url) {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function isDirectVideo(url) {
  return url && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export default function ModuleMedia({ mod }) {
  const embedUrl = mod.video_url ? getEmbedUrl(mod.video_url) : null;
  const isDirect = mod.video_url ? isDirectVideo(mod.video_url) : false;

  const hasMedia = mod.video_url || mod.article_url || (mod.social_links && mod.social_links.length > 0);
  if (!hasMedia) return null;

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      {/* Video */}
      {mod.video_url && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Video</p>
          {embedUrl ? (
            <div className="relative rounded-lg overflow-hidden max-w-xl" style={{ paddingBottom: "min(56.25%, 360px)", height: 0 }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Module video"
              />
            </div>
          ) : (
            <video controls className="w-full rounded-lg bg-black max-w-xl">
              <source src={mod.video_url} />
              Your browser does not support video playback.
            </video>
          )}
        </div>
      )}

      {/* Article */}
      {mod.article_url && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Read</p>
          <a
            href={mod.article_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors group"
          >
            <ExternalLink className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              {mod.article_title || mod.article_url}
            </span>
          </a>
        </div>
      )}

      {/* Social Links */}
      {mod.social_links && mod.social_links.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Follow / Watch</p>
          <div className="flex flex-wrap gap-2">
            {mod.social_links.map((link, i) => {
              const platform = link.platform?.toLowerCase() || "";
              const Icon = PLATFORM_ICONS[platform];
              const colorClass = PLATFORM_COLORS[platform] || "text-foreground";
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted/40 transition-colors text-sm font-medium"
                >
                  {Icon ? (
                    <Icon className={`w-4 h-4 ${colorClass}`} />
                  ) : (
                    <ExternalLink className={`w-4 h-4 ${colorClass}`} />
                  )}
                  <span>{link.label || link.platform || "Link"}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}