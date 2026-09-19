import { FormEvent, useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import api from '@/services/api';

type Message = { id: string; user_id: string; content: string; created_at: string };
export default function AccountabilityChat() {
  const [messages,setMessages]=useState<Message[]>([]); const [content,setContent]=useState(''); const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(true);
  const load=async()=>{try{setMessages((await api.getAccountabilityMessages()).data)}catch(e){setError(e instanceof Error?e.message:'Chat unavailable')}finally{setLoading(false)}};
  useEffect(()=>{void load(); void api.markAccountabilityRead()},[]);
  const send=async(e:FormEvent)=>{e.preventDefault(); if(!content.trim())return; try{const m=await api.sendAccountabilityMessage(content.trim());setMessages(v=>[...v,m]);setContent('')}catch(e){setError(e instanceof Error?e.message:'Message failed')}};
  return <div className="min-h-screen bg-background"><Navbar/><main className="container mx-auto max-w-2xl px-4 pt-24 py-8"><Card><CardHeader><CardTitle>Accountability chat</CardTitle></CardHeader><CardContent><div className="min-h-80 max-h-[55vh] overflow-y-auto space-y-3 border rounded-md p-4">{loading?'Loading messages…':messages.length===0?<p className="text-muted-foreground">No messages yet. Start the conversation.</p>:messages.map(m=><div key={m.id} className="rounded-md bg-muted p-3"><p className="text-sm">{m.content}</p><p className="text-xs text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</p><div className="flex gap-2 mt-2"><Button size="sm" variant="ghost" onClick={async()=>{const next=window.prompt('Edit message',m.content);if(next){await api.editAccountabilityMessage(m.id,next);await load()}}}>Edit</Button><Button size="sm" variant="ghost" onClick={async()=>{await api.deleteAccountabilityMessage(m.id);await load()}}>Delete</Button><Button size="sm" variant="ghost" onClick={async()=>{await api.reportAccountabilityMessage(m.id,'Reported by learner')}}>Report</Button></div></div>)}</div>{error&&<p className="text-sm text-destructive mt-3">{error}</p>}<form onSubmit={send} className="mt-4 space-y-2"><Textarea value={content} onChange={e=>setContent(e.target.value)} maxLength={2000} placeholder="Encourage your group…" aria-label="Chat message"/><Button type="submit">Send message</Button></form></CardContent></Card></main></div>;
}
