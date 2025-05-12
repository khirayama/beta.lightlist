import type { AppProps } from "next/app";

import { setSessionStorage } from "sdk";

import "./globals.css";

setSessionStorage("web");

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
