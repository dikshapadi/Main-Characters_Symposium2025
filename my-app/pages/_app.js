import '../styles/globals.css';
import { Outfit } from 'next/font/google';
import Head from "next/head";

const inter = Outfit({ subsets: ['latin'] });

export default function App({ Component, pageProps }) {
  return (
        <div className={`${inter.className} h-full`}>
          <Head>
            <title>Mobility App</title>
          </Head>
          <Component {...pageProps} />
        </div>
  );
}
