import VoiceCloner  from '@/components/voice-cloner';

export default function Home() {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <VoiceCloner />
        </div>
      </main>
    );
}