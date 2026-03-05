import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3]
    }
  }),
  Underline,
  Link.configure({
    autolink: true,
    openOnClick: false,
    linkOnPaste: true
  }),
  Image.configure({
    allowBase64: false
  })
];

export const EMPTY_DOC = {
  type: "doc",
  content: [{ type: "paragraph" }]
} as const;
