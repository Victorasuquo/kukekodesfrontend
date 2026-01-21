import { useState, useEffect } from 'react';
import api, { Thread } from '@/services/api';
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
            // Error logged by api.ts
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
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);

            await api.createThread(formData);

            toast({ title: 'Success', description: 'Thread created successfully' });
            setNewThreadOpen(false);
            setTitle('');
            setContent('');
            fetchThreads(); // Refresh list
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
                            <DialogDescription>Start a discussion with the community.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Thread Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="What's on your mind?"
                                    rows={5}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateThread}>Post Thread</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {threads.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                        <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No threads yet</h3>
                        <p className="text-muted-foreground">Be the first to start a conversation!</p>
                    </div>
                ) : (
                    threads.map(thread => (
                        <Card key={thread.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-10 h-10 border">
                                            <AvatarImage src={thread.author?.profile_picture} />
                                            <AvatarFallback>{thread.author?.username?.substring(0, 2).toUpperCase() || 'US'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <CardTitle className="text-lg">{thread.title}</CardTitle>
                                            <CardDescription>
                                                Posted by <span className="font-medium text-foreground">{thread.author?.username || 'Unknown'}</span> • {thread.created_at ? formatDistanceToNow(new Date(thread.created_at), { addSuffix: true }) : 'Recently'}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {thread.course && (
                                        <div className="text-xs bg-muted px-2 py-1 rounded">Course #{thread.course}</div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground line-clamp-2">{thread.content}</p>
                            </CardContent>
                            <CardFooter className="pt-0 text-sm text-muted-foreground">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Comments</span>
                                </div>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
