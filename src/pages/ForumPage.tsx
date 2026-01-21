import { Forum } from '@/components/sections/Forum';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function ForumPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Forum />
            </main>
            <Footer />
        </div>
    );
}
