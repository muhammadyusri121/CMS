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
        'rounded-xl border bg-slate-950 overflow-hidden',
        error
          ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
          : 'border-slate-800 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500',
        className
      )}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-blue-100 bg-slate-900/50 p-2">
        {/* History */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Undo className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Redo className="h-4 w-4" />
          </Toggle>
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6 bg-blue-200" />
        
        {/* Headings */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6 bg-blue-200" />
        
        {/* Formatting */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Code className="h-4 w-4" />
          </Toggle>
        </div>
        
        <Separator orientation="vertical" className="mx-1 h-6 bg-blue-200" />
        
        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('blockquote')}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
            className="h-8 w-8 p-0 data-[state=on]:bg-blue-100 data-[state=on]:text-blue-700"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>
      </div>
      
      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="min-h-[250px] max-h-[500px] overflow-auto p-4 prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  );
}
