import { useCallback, useId, useState } from 'react';
import { CATEGORIES } from '../lib/categories';
import { NETLIFY_LISTING_FORM_NAME } from '../lib/netlify-listing-form';

const fieldClass = `
  mt-1 block w-full rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900
  px-3 py-2 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500
  focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:focus:border-violet-400
  dark:focus:ring-violet-400/30
`;

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-zinc-200';

interface SubmitListingFormProps {
  repoBase: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function SubmitListingForm({ repoBase }: SubmitListingFormProps) {
  const [status, setStatus] = useState<FormStatus>('idle');
  const formId = useId();
  const listingsFolderUrl = `${repoBase}/tree/main/src/content/listings`;

  const onSubmit = useCallback(async (e: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('submitting');
    const params = new URLSearchParams();
    new FormData(form).forEach((value, key) => {
      if (typeof value === 'string') params.append(key, value);
    });
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  }, []);

  if (status === 'success') {
    return (
      <div className="space-y-6">
        <div
          className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-emerald-900 dark:text-emerald-100"
          role="status"
        >
          <p className="font-medium">Thanks — your listing was received.</p>
          <p className="mt-1 text-sm opacity-90">
            We’ll follow up or add it to Hunt & Haul after a quick review.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
          >
            Submit another
          </button>
          <a href="/" className="text-sm font-medium text-gray-600 dark:text-zinc-400 hover:underline">
            Back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form
        id={formId}
        name={NETLIFY_LISTING_FORM_NAME}
        method="POST"
        action="/"
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <input type="hidden" name="form-name" value={NETLIFY_LISTING_FORM_NAME} />

        <p className="hidden" aria-hidden="true">
          <label>
            Do not fill this in:{' '}
            <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <div>
          <label htmlFor={`${formId}-name`} className={labelClass}>
            Name <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            name="name"
            required
            maxLength={200}
            autoComplete="organization"
            placeholder="e.g. Giant Robot Gallery"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-category`} className={labelClass}>
            Category <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <select
            id={`${formId}-category`}
            name="category"
            required
            defaultValue=""
            className={fieldClass}
          >
            <option value="" disabled>
              Select a category…
            </option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-url`} className={labelClass}>
            Website URL <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            id={`${formId}-url`}
            type="url"
            name="url"
            required
            inputMode="url"
            placeholder="https://…"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-description`} className={labelClass}>
            Description <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <textarea
            id={`${formId}-description`}
            name="description"
            required
            rows={4}
            maxLength={4000}
            placeholder="What do they sell or show? Why list them here?"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-tags`} className={labelClass}>
            Tags <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
          </label>
          <input
            id={`${formId}-tags`}
            type="text"
            name="tags"
            placeholder="comma-separated, e.g. vinyl, designer toys, japan"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-location`} className={labelClass}>
            Location <span className="text-gray-400 dark:text-zinc-500 font-normal">(optional)</span>
          </label>
          <input
            id={`${formId}-location`}
            type="text"
            name="location"
            maxLength={200}
            placeholder="City, region, or online"
            className={fieldClass}
          />
        </div>

        <label className="flex gap-3 items-start cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            value="yes"
            className="mt-1 size-4 rounded border-gray-300 dark:border-zinc-600 text-violet-600 focus:ring-violet-500"
          />
          <span className="text-sm text-gray-700 dark:text-zinc-200">
            Request <strong>featured</strong> placement (editors decide; most listings stay standard).
          </span>
        </label>

        {status === 'error' && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            Something went wrong. Check your connection and try again, or use the GitHub link below.
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-violet-400 dark:focus:ring-offset-zinc-900"
          >
            {status === 'submitting' ? 'Sending…' : 'Send listing'}
          </button>
        </div>
      </form>

      <div className="border-t border-gray-200 dark:border-zinc-700 pt-6 space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
          Prefer GitHub?
        </p>
        <p className="text-sm text-gray-600 dark:text-zinc-400">
          Add a Markdown file under{' '}
          <code className="text-xs bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">src/content/listings/</code>{' '}
          and open a pull request — same fields as the form (YAML frontmatter).
        </p>
        <a
          href={listingsFolderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700"
        >
          Browse listings folder
        </a>
      </div>
    </div>
  );
}
