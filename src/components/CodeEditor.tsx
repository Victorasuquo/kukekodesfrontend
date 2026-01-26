import { useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Terminal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CodeEditorProps {
    lessonId: string;
}

export function CodeEditor({ lessonId }: CodeEditorProps) {
    const [code, setCode] = useState("print('Hello, World!')");
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const runCode = async () => {
        setLoading(true);
        setOutput('');

        try {
            const { submission_id } = await api.runCode(code, lessonId);
            if (submission_id) {
                checkStatus(submission_id);
            }
        } catch (error) {
            toast({ title: 'Coming Soon', description: 'Code execution feature is coming soon!', variant: 'default' });
            setLoading(false);
        }
    };

    const checkStatus = async (submissionId: string) => {
        try {
            const data = await api.getSubmissionStatus(submissionId);

            if (data.status === 'completed' || data.status === 'failed') {
                setOutput(data.output || data.error || 'No output');
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
                    Python Playground
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
