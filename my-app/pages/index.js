// pages/index.js

import Head from 'next/head';

export default function Home() {
  return (
    <div className="relative h-screen overflow-hidden text-white">
      <Head>
        <title>Daura | Your Guided Companion</title>
        <meta name="description" content="Daura is your friendly, voice-enabled workplace companion designed to assist neurodivergent and mobility-challenged individuals." />
      </Head>

      {/* Background Video */}
      <video
  autoPlay
  loop
  muted
  playsInline
  className="absolute top-0 left-0 w-full h-full object-cover z-0"
>
  <source src="/bg.mp4" type="video/mp4" />
</video>


      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>

      {/* Hero Content */}
      <main className="relative z-20 flex flex-col items-center justify-center h-full px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight drop-shadow-lg">
          Meet <span className="text-pink-400">Daura</span>
        </h1>
        <p className="text-xl md:text-2xl max-w-2xl mb-8 drop-shadow-md">
          Your friendly, voice-enabled companion helping neurodivergent and mobility-challenged individuals navigate work and wellness with ease.
        </p>
        <a
          href="#"
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-full transition duration-300 shadow-lg"
        >
          Start Exploring
        </a>
      </main>
    </div>
  );
}
