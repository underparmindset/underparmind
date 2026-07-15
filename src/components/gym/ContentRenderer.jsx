import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function ContentRenderer({ content, className }) {
  if (!content) return null;

  const isHTML = /<(p|div|h[1-6]|ul|ol|li|blockquote|span|strong|em|br)\b/i.test(content);

  if (isHTML) {
    return (
      <div
        className={cn("content-rendered text-foreground text-sm", className)}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={cn("content-rendered text-foreground text-sm", className)}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}