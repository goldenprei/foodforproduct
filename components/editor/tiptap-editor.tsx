"use client";

import { useRef } from "react";

import { EditorContent, useEditor } from "@tiptap/react";

import { editorExtensions } from "@/lib/content/extensions";

type Props = {
  initialContent: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  onUploadImage: (file: File) => Promise<string>;
  isUploadingImage?: boolean;
};

export function TiptapEditor({ initialContent, onChange, onUploadImage, isUploadingImage = false }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContent,
    onUpdate: ({ editor: editorInstance }) => {
      onChange(editorInstance.getJSON() as Record<string, unknown>);
    },
    editorProps: {
      attributes: {
        class: "ProseMirror"
      }
    }
  });

  if (!editor) {
    return <div className="panel" style={{ padding: "0.9rem" }}>Loading editor…</div>;
  }

  async function handleImageFile(file: File) {
    if (!editor) {
      return;
    }
    const url = await onUploadImage(file);
    editor.chain().focus().setImage({ src: url, alt: file.name }).run();
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <button
          className={editor.isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
          type="button"
        >
          Bold
        </button>
        <button
          className={editor.isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          type="button"
        >
          Italic
        </button>
        <button
          className={editor.isActive("underline") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          type="button"
        >
          Underline
        </button>
        <button
          className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          type="button"
        >
          H1
        </button>
        <button
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          type="button"
        >
          H2
        </button>
        <button
          className={editor.isActive("heading", { level: 3 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          type="button"
        >
          H3
        </button>
        <button
          className={editor.isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          type="button"
        >
          Bullets
        </button>
        <button
          className={editor.isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          type="button"
        >
          Numbered
        </button>
        <button onClick={() => editor.chain().focus().sinkListItem("listItem").run()} type="button">
          Indent
        </button>
        <button onClick={() => editor.chain().focus().liftListItem("listItem").run()} type="button">
          Outdent
        </button>
        <button
          className={editor.isActive("blockquote") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          type="button"
        >
          Quote
        </button>
        <button
          className={editor.isActive("codeBlock") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          type="button"
        >
          Code
        </button>
        <button
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const href = window.prompt("Link URL", previous || "https://");
            if (href === null) {
              return;
            }
            if (!href.trim()) {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: href.trim() }).run();
          }}
          type="button"
        >
          Link
        </button>
        <button onClick={() => fileInputRef.current?.click()} type="button" disabled={isUploadingImage}>
          {isUploadingImage ? "Uploading..." : "Image"}
        </button>
        <button
          onClick={() => editor.chain().focus().insertContent("$x^2 + y^2$").run()}
          type="button"
          title="Inline LaTeX"
        >
          Inline LaTeX
        </button>
        <button
          onClick={() => editor.chain().focus().insertContent("$$\\int_0^1 x^2 dx$$").run()}
          type="button"
          title="Block LaTeX"
        >
          Block LaTeX
        </button>
        <button onClick={() => editor.chain().focus().undo().run()} type="button">
          Undo
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} type="button">
          Redo
        </button>
      </div>

      <input
        hidden
        accept="image/*"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) {
            return;
          }
          try {
            await handleImageFile(file);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Image upload failed";
            window.alert(message);
          } finally {
            event.target.value = "";
          }
        }}
        ref={fileInputRef}
        type="file"
      />

      <div className="editor-surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
