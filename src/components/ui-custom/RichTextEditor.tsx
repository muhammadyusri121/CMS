import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Strikethrough,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Tulis konten di sini...',
  className,
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-white overflow-hidden shadow-sm transition-all',
        error
          ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-100'
          : 'border-slate-200 focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-100 p-2.5">
        {/* History */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

        {/* Headings */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

        {/* Formatting */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="mx-1 h-6 bg-slate-200" />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 data-[state=on]:bg-primary-50 data-[state=on]:text-primary-700 data-[state=on]:border-primary-100"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[250px] max-h-[500px] overflow-auto p-4 prose prose-sm prose-slate max-w-none focus:outline-none bg-white"
      />
    </div>
  );
}
