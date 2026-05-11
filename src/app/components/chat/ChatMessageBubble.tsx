import { Bot, Bath, Bed, ChevronRight, MapPin, Sparkles, User } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ChatRole = 'assistant' | 'user';

interface PropertyData {
  title?: string;
  location?: string;
  price?: string;
  bedrooms?: number;
  bathrooms?: number;
  image_url?: string;
}

interface ChatMessageBubbleProps {
  role: ChatRole;
  content: string;
}

function parsePropertyData(rawContent: string) {
  const match = rawContent.match(/\[PROPERTY_DATA\]([\s\S]*?)\[\/PROPERTY_DATA\]/);
  if (!match) {
    return { cleanContent: rawContent, propertyData: null as PropertyData | null };
  }

  let propertyData: PropertyData | null = null;
  try {
    propertyData = JSON.parse(match[1].trim()) as PropertyData;
  } catch {
    propertyData = null;
  }

  return {
    cleanContent: rawContent.replace(/\[PROPERTY_DATA\][\s\S]*?\[\/PROPERTY_DATA\]/, '').trim(),
    propertyData,
  };
}

function PropertyCard({ propertyData }: { propertyData: PropertyData }) {
  const imageUrl =
    propertyData.image_url ||
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80';

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={propertyData.title || 'Recommended property'}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {propertyData.price && (
          <div className="absolute right-4 top-4 rounded-2xl border border-emerald-100 bg-white/90 px-4 py-2 text-sm font-black text-emerald-700 shadow-lg backdrop-blur">
            {propertyData.price}
          </div>
        )}
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <h4 className="text-base font-black tracking-tight text-slate-900">
            {propertyData.title || 'Suggested Property'}
          </h4>
          {propertyData.location && (
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <span>{propertyData.location}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Bed className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">
              {propertyData.bedrooms ?? '-'} Beds
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
              <Bath className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-600">
              {propertyData.bathrooms ?? '-'} Baths
            </span>
          </div>
        </div>

        <button
          type="button"
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700"
        >
          View Property Details
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

export function ChatMessageBubble({ role, content }: ChatMessageBubbleProps) {
  const isAssistant = role === 'assistant';
  const { cleanContent, propertyData } = parsePropertyData(content);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`flex w-full ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`flex max-w-[92%] items-start gap-3 md:max-w-[86%] ${
          isAssistant ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        <div
          className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
            isAssistant
              ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-emerald-700/20'
              : 'border border-slate-200 bg-white text-slate-500 shadow-slate-200/70'
          }`}
        >
          {isAssistant ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </div>

        <div className={`flex min-w-0 flex-col gap-3 ${isAssistant ? 'items-start' : 'items-end'}`}>
          <div
            className={`relative overflow-hidden rounded-[1.6rem] px-5 py-4 shadow-sm ${
              isAssistant
                ? 'rounded-tl-md border border-slate-200/80 bg-white text-slate-800 shadow-slate-200/70'
                : 'rounded-tr-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-700/20'
            }`}
          >
            {isAssistant && (
              <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700/80">
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Assistant</span>
              </div>
            )}

            <div className={isAssistant ? 'chat-markdown text-[13.5px] text-slate-700 md:text-sm' : 'chat-markdown chat-markdown-invert text-[13.5px] text-white md:text-sm'}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2.5 leading-6 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="mb-2.5 list-disc space-y-1.5 pl-5 last:mb-0">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2.5 list-decimal space-y-1.5 pl-5 last:mb-0">{children}</ol>,
                  li: ({ children }) => <li className="pl-1 marker:text-emerald-500">{children}</li>,
                  strong: ({ children }) => (
                    <strong className={isAssistant ? 'font-black text-slate-900' : 'font-black text-white'}>
                      {children}
                    </strong>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200/80">
                      <table className="min-w-full border-collapse text-left text-[13px] md:text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className={isAssistant ? 'bg-slate-50 text-slate-700' : 'bg-white/10 text-white'}>
                      {children}
                    </thead>
                  ),
                  th: ({ children }) => <th className="px-4 py-3 font-black">{children}</th>,
                  td: ({ children }) => (
                    <td className={isAssistant ? 'border-t border-slate-200 px-4 py-3 align-top' : 'border-t border-white/15 px-4 py-3 align-top'}>
                      {children}
                    </td>
                  ),
                  code: ({ children }) => (
                    <code
                      className={`rounded-lg px-1.5 py-0.5 text-[0.92em] ${
                        isAssistant ? 'bg-slate-100 text-slate-800' : 'bg-black/20 text-white'
                      }`}
                    >
                      {children}
                    </code>
                  ),
                }}
              >
                {cleanContent}
              </ReactMarkdown>
            </div>
          </div>

          {isAssistant && propertyData && <PropertyCard propertyData={propertyData} />}
        </div>
      </div>
    </motion.article>
  );
}

export function ChatTypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex justify-start"
    >
      <div className="flex max-w-[85%] items-start gap-3">
        <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-700/20">
          <Bot className="h-5 w-5" />
        </div>
        <div className="rounded-[1.6rem] rounded-tl-md border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/60">
          <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700/75">
            Composing response
          </div>
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-300 animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 [animation-delay:0.15s] animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-emerald-500 [animation-delay:0.3s] animate-bounce" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
