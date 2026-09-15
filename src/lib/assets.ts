/**
 * Resolves a file in /public against the app's base URL so the same build
 * works from a domain root or a project subpath (e.g. GitHub Pages).
 */
export function asset(name: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${base.endsWith('/') ? '' : '/'}${name.replace(/^\//, '')}`;
}

export const LOGO_DARK_TEXT = () => asset('darklogo.png');
export const LOGO_LIGHT_TEXT = () => asset('lightlogo.png');
