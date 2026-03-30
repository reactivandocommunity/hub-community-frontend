import {
  BlocksRenderer,
  type BlocksContent,
} from '@strapi/blocks-react-renderer';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface ExpandableRichTextProps {
  content: BlocksContent | string;
  className?: string;
  maxLines?: number;
}

/**
 * Renders text with newlines converted to <br /> and paragraphs,
 * preserving the author's formatting.
 */
function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <>
      {paragraphs.map((paragraph, i) => {
        const lines = paragraph.split('\n');
        return (
          <p key={i} className="mb-4 last:mb-0">
            {lines.map((line, j) => (
              <React.Fragment key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

export const ExpandableRichText: React.FC<ExpandableRichTextProps> = ({
  content,
  className,
  maxLines = 12,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Show button if content overflows
      setShowButton(
        contentRef.current.scrollHeight > contentRef.current.clientHeight + 2
      );
    }
  }, [content]);

  return (
    <div>
      <div
        ref={contentRef}
        className={cn(
          'prose prose-sm sm:prose-base dark:prose-invert max-w-none',
          'prose-p:text-muted-foreground prose-p:leading-relaxed',
          'prose-strong:text-foreground prose-strong:font-semibold',
          'prose-headings:text-foreground prose-headings:font-semibold',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-li:text-muted-foreground',
          'prose-ul:my-2 prose-ol:my-2',
          'transition-all duration-300 ease-in-out',
          className,
          !expanded && 'overflow-hidden'
        )}
        style={{
          WebkitLineClamp: !expanded ? maxLines : 'unset',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical' as const,
        }}
      >
        {typeof content === 'string' ? (
          <FormattedText text={content} />
        ) : (
          <BlocksRenderer content={content} />
        )}
      </div>
      {showButton && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-4 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        </div>
      )}
    </div>
  );
};
