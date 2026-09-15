/**
 * base: './' keeps every asset reference relative, so the same build runs from
 * a domain root, a GitHub Pages project subpath, or a local file server.
 * The app uses a hash router, so there is no SPA rewrite to configure either.
 */
declare const _default: import("vite").UserConfig;
export default _default;
