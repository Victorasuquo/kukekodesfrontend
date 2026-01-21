import { LiveSessions } from '@/components/sections/LiveSessions';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LivePage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
                            Live Coding Sessions
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Join interactive workshops and learn directly from instructors in real-time.
                        </p>
                    </div>
                    <LiveSessions />
                </div>
            </main>
            <Footer />
        </div>
    );
}
