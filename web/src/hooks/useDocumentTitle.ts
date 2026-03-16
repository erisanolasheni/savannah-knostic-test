import { useEffect } from 'react';

const APP_TITLE = 'Tiny Inventory';

/**
 * Sets the browser tab title for the current page.
 * Restores the app title on unmount.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | ${APP_TITLE}` : APP_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
