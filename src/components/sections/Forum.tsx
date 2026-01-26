import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ThreadCardSkeleton } from '@/components/ui/card-skeleton';

// Thread type for forum
interface Thread {
    id: string;
    title: string;
    author: string;
    replies_count: number;
    created_at: string;
}

export function Forum() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [newThreadOpen, setNewThreadOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { toast } = useToast();

    const fetchThreads = async () => {
        setLoading(true);
        try {
            const data = await api.getThreads();
            setThreads(data);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to load forum threads', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThreads();
    }, []);

    const handleCreateThread = async () => {
        try {
            await api.createThread(title, content);

            toast({ title: 'Success', description: 'Thread created successfully' });
            setNewThreadOpen(false);
            setTitle('');
            setContent('');
            fetchThreads();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create thread', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <ThreadCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Community Forum</h2>
                    <p className="text-muted-foreground">Discuss courses, ask questions, and share knowledge.</p>
                </div>
                <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" /> New Thread
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Thread</DialogTitle>
                            <DialogDescription>Start a new discussion in the community.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="thread-title" className="text-sm font-medium">Title</label>
                                <Input
                                    id="thread-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What's your question or topic?"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="thread-content" className="text-sm font-medium">Content</label>
                                <Textarea
                                    id="thread-content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Provide more details..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setNewThreadOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateThread} disabled={!title.trim()}>Create Thread</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {threads.length === 0 ? (
                <Card className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No threads yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to start a discussion!</p>
                    <Button onClick={() => setNewThreadOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Create Thread
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {threads.map((thread) => (
                        <Card key={thread.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Avatar className="w-10 h-10">
                                        <AvatarFallback>{thread.author?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground">{thread.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                            <span>{thread.author}</span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-sm">{thread.replies_count}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
