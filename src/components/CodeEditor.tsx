import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Terminal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
    lessonId: string;
    runtime?: 'python' | 'javascript';
}

export function CodeEditor({ lessonId, runtime = 'javascript' }: CodeEditorProps) {
    const [code, setCode] = useState("console.log('Hello, World!');");
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<Array<{ submission_id: string; status: string; score?: number | null }>>([]);
    const { toast } = useToast();

    useEffect(() => { void api.getCodeSubmissionHistory(lessonId).then(setHistory).catch(() => setHistory([])); }, [lessonId]);

    const runCode = async () => {
        setLoading(true);
        setOutput('');

        try {
            const { submission_id } = await api.runCode(code, lessonId, runtime);

            if (submission_id) {
                checkStatus(submission_id);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to submit code', variant: 'destructive' });
            setLoading(false);
        }
    };

    const checkStatus = async (submissionId: string) => {
        try {
            const data = await api.getSubmissionStatus(submissionId);

            if (data.status === 'completed' || data.status === 'failed') {
                setOutput(data.output || data.error || 'No output');
                setHistory((items) => [{ submission_id: submissionId, status: data.status, score: data.score }, ...items.filter((item) => item.submission_id !== submissionId)]);
                setLoading(false);
            } else {
                setTimeout(() => checkStatus(submissionId), 1000);
            }
        } catch (error) {
            setOutput('Error checking submission status');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[400px] border border-border rounded-lg bg-card overflow-hidden">
            <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-foreground font-medium px-2">
                    <Terminal className="w-4 h-4" />
                    {runtime === 'python' ? 'Python' : 'JavaScript'} Playground
                </div>
                <Button size="sm" onClick={runCode} disabled={loading} className="h-8">
                    {loading ? (
                        <>
                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <Play className="w-3 h-3 mr-2" />
                            Run Code
                        </>
                    )}
                </Button>
            </div>

            {history.length > 0 && <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">Recent submissions: {history.slice(0, 3).map((item) => `${item.status}${item.score != null ? ` (${item.score}%)` : ''}`).join(' · ')}</div>}

            <div className="flex-1 flex flex-col md:flex-row">
                {/* Editor Area */}
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 p-4 font-mono text-sm bg-background text-foreground resize-none focus:outline-none"
                    spellCheck={false}
                />

                {/* Output Area */}
                <div className="h-1/3 md:h-auto md:w-1/3 border-t md:border-t-0 md:border-l border-border bg-muted/50 p-4 font-mono text-sm overflow-auto">
                    <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Output</div>
                    <pre className="whitespace-pre-wrap break-words">{output}</pre>
                </div>
            </div>
        </div>
    );
}
