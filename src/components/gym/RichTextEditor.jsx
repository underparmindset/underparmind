import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

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