export const THEME_STORAGE_KEY = 'phonlet-theme';

// Runs before paint so a saved dark preference never flashes a light page.
export const themeScript = `(function(){var t;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`;
