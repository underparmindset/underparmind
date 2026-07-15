import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Register custom line-height format
const Parchment = Quill.import("parchment");
const LineHeightAttributor = new Parchment.Attributor.Style(
  "lineheight",
  "line-height",
  {
    scope: Parchment.Scope.BLOCK,
    whitelist: ["1.3", "1.5", "1.75", "2", "2.5"],
  }
);
Quill.register(LineHeightAttributor, true);

const MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      [{ font: [] }],
      [{ size: ["small", "normal", "large", "huge"] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ lineheight: ["1.3", "1.5", "1.75", "2", "2.5"] }],
      ["blockquote"],
      ["clean"],
    ],
  },
};

export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={MODULES}
        placeholder={placeholder}
      />
    </div>
  );
}