import { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api, { AccountabilityCluster, AccountabilityStatus } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Accountability() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AccountabilityStatus | null>(null);
  const [cluster, setCluster] = useState<AccountabilityCluster | null>(null);
  const [progress, setProgress] = useState<Array<{ display_name: string; completed_lessons: number; current_streak: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = async () => { try { setError(null); const next = await api.getAccountabilityStatus(); setStatus(next); if (next.status === 'active') { setCluster(await api.getAccountabilityCluster()); setProgress((await api.getAccountabilityProgress()).data); } } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load accountability status'); } finally { setLoading(false); } };
  useEffect(() => { if (user) void refresh(); else setLoading(false); }, [user]);
  if (!user) return <div className="min-h-screen grid place-items-center">Sign in to use accountability groups.</div>;
  return <div className="min-h-screen bg-background"><Navbar /><main className="container mx-auto px-4 pt-24 py-8 max-w-3xl"><h1 className="text-3xl font-bold mb-2">Accountability group</h1><p className="text-muted-foreground mb-6">Learn independently, then stay motivated with a small peer group.</p>{error && <Card className="mb-4 border-destructive"><CardContent className="p-4 text-destructive">{error}</CardContent></Card>}{loading ? <Card><CardContent className="p-8 text-center">Loading your group status…</CardContent></Card> : status?.status === 'active' && cluster ? <><Card><CardHeader><CardTitle>{cluster.name}</CardTitle><CardDescription>{cluster.members.length} of {cluster.capacity} members</CardDescription></CardHeader><CardContent><div className="flex flex-wrap gap-2">{cluster.members.map(member => <Badge key={member.id} variant="secondary">{member.display_name}</Badge>)}</div><Button className="mt-6" variant="outline" onClick={async () => { await api.leaveAccountability(); await refresh(); }}>Leave group</Button></CardContent></Card><Card className="mt-4"><CardHeader><CardTitle>Weekly progress</CardTitle><CardDescription>Privacy-safe accountability signals</CardDescription></CardHeader><CardContent><div className="space-y-3">{progress.map(item => <div key={item.display_name} className="flex justify-between border-b pb-2"><span>{item.display_name}</span><span>{item.completed_lessons} lessons · {item.current_streak} day streak</span></div>)}</div></CardContent></Card></> : <Card><CardHeader><CardTitle>{status?.status === 'waiting' ? 'You are in the matching queue' : 'Join an accountability group'}</CardTitle><CardDescription>{status?.message || 'Groups form at 15 learners or after 7 days with at least 3 learners.'}</CardDescription></CardHeader><CardContent><Button onClick={async () => { await api.joinAccountabilityQueue(); await refresh(); }} disabled={status?.status === 'waiting'}>{status?.status === 'waiting' ? 'Waiting for learners' : 'Join matching queue'}</Button></CardContent></Card>}</main></div>;
}
