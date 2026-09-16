import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Eye,
  Edit3,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
} from 'lucide-react';
import { countWords, calculateReadTime } from '../lib/blogValidation';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  minHeight = '360px',
  placeholder = 'Write your captivating travel story here...',
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'html' | 'preview'>('visual');
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Sync incoming value to contentEditable when not user-typing
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (!editorRef.current) return;
    isUpdatingRef.current = true;
    const html = editorRef.current.innerHTML;
    onChange(html);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const exec = (command: string, val: string | undefined = undefined) => {
    if (activeTab !== 'visual') return;
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleInsertLink = () => {
    const url = window.prompt('Enter URL (including https://):');
    if (url) {
      exec('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) {
      exec('insertImage', url);
    }
  };

  const handleFormatBlock = (tag: string) => {
    exec('formatBlock', tag);
  };

  const words = countWords(value || '');
  const readingTime = calculateReadTime(value || '');

  return (
    <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/80 px-3 py-2 gap-2">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'visual'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            <Edit3 size={13} /> Visual
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'html'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            <Code size={13} /> HTML Source
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-zinc-200'
            }`}
          >
            <Eye size={13} /> Preview
          </button>
        </div>

        {/* Formatting Actions (Active only in Visual mode) */}
        {activeTab === 'visual' && (
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => handleFormatBlock('<h2>')}
              title="Heading 2"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('<h3>')}
              title="Heading 3"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Heading3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('<p>')}
              title="Paragraph"
              className="px-2 py-1 text-xs font-bold text-gray-600 dark:text-zinc-400 hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              P
            </button>

            <span className="w-[1px] h-4 bg-gray-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={() => exec('bold')}
              title="Bold"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('italic')}
              title="Italic"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('underline')}
              title="Underline"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Underline size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('strikeThrough')}
              title="Strikethrough"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Strikethrough size={15} />
            </button>

            <span className="w-[1px] h-4 bg-gray-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={() => exec('insertUnorderedList')}
              title="Bullet List"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => exec('insertOrderedList')}
              title="Numbered List"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ListOrdered size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('<blockquote>')}
              title="Quote"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Quote size={15} />
            </button>

            <span className="w-[1px] h-4 bg-gray-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={handleInsertLink}
              title="Insert Link"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-[#FF9933] hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={handleInsertImage}
              title="Insert Image by URL"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-[#FF9933] hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ImageIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => exec('removeFormat')}
              title="Clear Formatting"
              className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-red-500 hover:bg-gray-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <RemoveFormatting size={15} />
            </button>

            <span className="w-[1px] h-4 bg-gray-300 dark:bg-zinc-700 mx-1" />

            <button
              type="button"
              onClick={() => exec('undo')}
              title="Undo"
              className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => exec('redo')}
              title="Redo"
              className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-white rounded-lg transition-colors"
            >
              <RotateCw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 bg-white dark:bg-zinc-900" style={{ minHeight }}>
        {activeTab === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onBlur={handleInput}
            data-placeholder={placeholder}
            className="w-full h-full p-5 outline-none prose prose-sm md:prose-base dark:prose-invert max-w-none focus:ring-0 leading-relaxed overflow-y-auto"
            style={{ minHeight }}
          />
        )}

        {activeTab === 'html' && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-full p-4 font-mono text-xs bg-zinc-950 text-emerald-400 outline-none resize-y"
            style={{ minHeight }}
            placeholder="<p>Enter raw HTML content here...</p>"
          />
        )}

        {activeTab === 'preview' && (
          <div className="w-full h-full p-6 overflow-y-auto bg-gray-50/50 dark:bg-zinc-950" style={{ minHeight }}>
            <div
              className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: value || '<p className="text-gray-400 italic">No content yet.</p>' }}
            />
          </div>
        )}
      </div>

      {/* Bottom Status / Metrics Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
        <div className="flex items-center gap-4">
          <span>
            Words: <strong className="text-gray-800 dark:text-zinc-200">{words}</strong>
          </span>
          <span>
            Reading Time: <strong className="text-[#FF9933]">{readingTime}</strong>
          </span>
        </div>
        <div>
          <span>{activeTab.toUpperCase()} MODE</span>
        </div>
      </div>
    </div>
  );
};
