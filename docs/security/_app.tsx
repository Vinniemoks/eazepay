import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  // Here you could wrap pages in a common layout component
  // with a sidebar, header, etc.
  return <Component {...pageProps} />;
}

export default MyApp;