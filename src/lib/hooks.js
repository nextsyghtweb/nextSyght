import { useEffect } from 'react';

/**
 * Set the document title and (optionally) a noindex robots tag for a page.
 * Used by the admin page so search engines never list it.
 */
export function usePageMeta(title, noindex = false) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    let tag = null;
    if (noindex) {
      tag = document.createElement('meta');
      tag.name = 'robots';
      tag.content = 'noindex, nofollow';
      document.head.appendChild(tag);
    }

    return () => {
      document.title = previousTitle;
      if (tag) tag.remove();
    };
  }, [title, noindex]);
}
