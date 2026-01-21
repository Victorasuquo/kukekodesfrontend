import { useState, useEffect } from 'react';
import api, { LiveSession } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Users, Loader2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { SessionCardSkeleton } from '@/components/ui/card-skeleton';

export function LiveSessions() {
    const [sessions, setSessions] = useState<LiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const data = await api.getLiveSessions();
                setSessions(data);
            } catch (error) {
                // Error logged by api.ts
                toast({ title: 'Error', description: 'Failed to load live sessions', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [toast]);

    const handleJoinSession = async (sessionId: number, url: string) => {
        setJoining(sessionId);
        try {
            await api.joinSession(sessionId);
            window.open(url, '_blank');
            toast({ title: 'Joined session', description: 'Opening live stream...' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to join session', variant: 'destructive' });
        } finally {
            setJoining(null);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <SessionCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    const upcomingSessions = sessions.filter(s => !s.is_active && new Date(s.scheduled_start) > new Date());
    const activeSessions = sessions.filter(s => s.is_active);
    const pastSessions = sessions.filter(s => !s.is_active && new Date(s.scheduled_end) < new Date());

    return (
        <div className="space-y-8">
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <h2 className="text-2xl font-bold text-red-500">Live Now</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeSessions.map(session => (
                            <SessionCard key={session.id} session={session} onJoin={handleJoinSession} joining={joining} isActive />
                        ))}
                    </div>
                </section>
            )}

            {/* Upcoming Sessions */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>
                {upcomingSessions.length === 0 ? (
                    <p className="text-muted-foreground">No upcoming sessions scheduled.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingSessions.map(session => (
                            <SessionCard key={session.id} session={session} onJoin={handleJoinSession} joining={joining} />
                        ))}
                    </div>
                )}
            </section>

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Past Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
                        {pastSessions.map(session => (
                            <SessionCard key={session.id} session={session} onJoin={handleJoinSession} joining={joining} isPast />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

function SessionCard({
    session,
    onJoin,
    joining,
    isActive = false,
    isPast = false
}: {
    session: LiveSession;
    onJoin: (id: number, url: string) => void;
    joining: number | null;
    isActive?: boolean;
    isPast?: boolean;
}) {
    return (
        <Card className={`flex flex-col h-full ${isActive ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}>
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={isActive ? "destructive" : "secondary"}>
                        {isActive ? 'LIVE' : isPast ? 'Ended' : 'Upcoming'}
                    </Badge>
                    {session.course && <Badge variant="outline">Course #{session.course}</Badge>}
                </div>
                <CardTitle className="line-clamp-2">{session.title}</CardTitle>
                <CardDescription className="line-clamp-2">{session.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(session.scheduled_start), 'PPP')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(new Date(session.scheduled_start), 'p')} - {format(new Date(session.scheduled_end), 'p')}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Max Participants: {session.max_participants}
                </div>
                {session.instructor && (
                    <div className="text-sm font-medium pt-2">
                        Host: {session.instructor.first_name} {session.instructor.last_name}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    variant={isActive ? "default" : "secondary"}
                    disabled={!session.youtube_live_url || joining === session.id}
                    onClick={() => session.youtube_live_url && onJoin(session.id, session.youtube_live_url)}
                >
                    {joining === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : isActive ? (
                        <>
                            <Video className="w-4 h-4 mr-2" /> Join Stream
                        </>
                    ) : isPast ? (
                        <>
                            <PlayCircle className="w-4 h-4 mr-2" /> Watch Replay
                        </>
                    ) : (
                        'Join Waitlist'
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
