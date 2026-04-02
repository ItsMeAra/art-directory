import { useCallback, useEffect, useId, useRef, useState } from 'react';

const EXAMPLE_MARKDOWN = `---
name: Your listing name
category: gallery
tags:
  - contemporary-art
  - prints
url: https://example.com
description: >
  A short paragraph about what this place offers and why it belongs in the directory.
location: City, State
featured: false
---
`;

const CATEGORY_VALUES = [
  'gallery',
  'store',
  'online-marketplace',
  'artist-shop',
  'auction-house',
  'pop-up',
] as const;

interface SubmitListingHelpProps {
  /** e.g. https://github.com/owner/repo (no trailing slash) */
  repoBase: string;
}

export default function SubmitListingHelp({ repoBase }: SubmitListingHelpProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    const t = requestAnimationFrame(() => closeBtnRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [open, close]);

  const listingsFolderUrl = `${repoBase}/tree/main/src/content/listings`;
  const comparePrUrl = `${repoBase}/compare`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
      >
        Submit a listing
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-[1px]"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-lg max-h-[min(85vh,640px)] flex flex-col rounded-xl border border-gray-200 bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
              <h2 id={titleId} className="text-lg font-semibold text-gray-900 pr-2">
                Submit a listing
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={close}
                className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 text-sm text-gray-600 space-y-4">
              <p>
                This directory is built from Markdown files in the repo. Add yours by opening a pull request on GitHub.
              </p>

              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>
                  <a
                    href={repoBase}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 hover:underline font-medium"
                  >
                    Fork the repository
                  </a>
                  {' '}if you don’t already have write access.
                </li>
                <li>
                  Create a new branch (for example <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">add-my-listing</code>).
                </li>
                <li>
                  Add a file under{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">src/content/listings/</code>
                  {' '}
                  — use a short kebab-case name, e.g.{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">my-gallery.md</code>.
                </li>
                <li>
                  Fill in the frontmatter (YAML between the first two{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">---</code>
                  {' '}lines). Required fields:{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">name</code>,{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">category</code>,{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">url</code>,{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">description</code>
                  . Optional: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">tags</code>,{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">location</code>,{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">featured</code>.
                </li>
                <li>
                  Open a pull request from your branch into the main project.
                </li>
              </ol>

              <p className="text-xs text-gray-500">
                <strong className="text-gray-600">category</strong> must be one of:{' '}
                {CATEGORY_VALUES.map((c, i) => (
                  <span key={c}>
                    <code className="bg-gray-100 px-1 py-0.5 rounded">{c}</code>
                    {i < CATEGORY_VALUES.length - 1 ? ', ' : ''}
                  </span>
                ))}
                .
              </p>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Example file</p>
                <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto whitespace-pre">
                  {EXAMPLE_MARKDOWN}
                </pre>
              </div>

              <p className="text-xs text-gray-500">
                After you fork, open the same folder on <em>your</em> fork and use <strong>Add file</strong> to create the Markdown file, then propose a pull request.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={listingsFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  Browse listings folder
                </a>
                <a
                  href={comparePrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Compare & pull request
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
