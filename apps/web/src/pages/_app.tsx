import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";

import { setSessionStorage } from "sdk";

import "./globals.css";

setSessionStorage("web");

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(MyApp);
