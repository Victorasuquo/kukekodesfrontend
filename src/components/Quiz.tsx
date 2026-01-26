import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface QuizProps {
    quizId: string;
    onComplete?: () => void;
}

// Quiz types defined locally since not yet in main types
interface QuizAnswer {
    id: string;
    answer_text: string;
    is_correct: boolean;
}

interface QuizQuestion {
    id: string;
    question_text: string;
    answers: QuizAnswer[];
}

interface Quiz {
    id: string;
    title: string;
    passing_score: number;
    questions: QuizQuestion[];
}

export function Quiz({ quizId, onComplete }: QuizProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchQuiz = async () => {
            setLoading(true);
            try {
                const data = await api.getQuiz(quizId);
                setQuiz(data);
            } catch (error) {
                console.error("Failed to fetch quiz:", error);
                toast({ title: 'Coming Soon', description: 'Quiz feature is coming soon!', variant: 'default' });
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId, toast]);

    const handleOptionSelect = (questionId: string, answerId: string) => {
        if (submitted) return;
        setAnswers(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleSubmit = async () => {
        if (!quiz || !quiz.questions) return;

        // Calculate local score for immediate feedback
        let correctCount = 0;
        let totalQuestions = quiz.questions.length;

        quiz.questions.forEach(q => {
            const selectedAnswerId = answers[q.id];
            const correctAnswer = q.answers?.find(a => a.is_correct);
            if (correctAnswer && selectedAnswerId === correctAnswer.id) {
                correctCount++;
            }
        });

        const calculatedScore = (correctCount / totalQuestions) * 100;
        setScore(calculatedScore);
        const isPassed = calculatedScore >= quiz.passing_score;
        setPassed(isPassed);
        setSubmitted(true);

        // Submit to backend
        try {
            await api.submitQuizAttempt(quizId, answers);
            if (isPassed) {
                toast({ title: 'Quiz Passed! 🎉', description: `You scored ${Math.round(calculatedScore)}%` });
                if (onComplete) onComplete();
            } else {
                toast({ title: 'Quiz Failed', description: `You scored ${Math.round(calculatedScore)}%. Try again!`, variant: 'destructive' });
            }
        } catch (error) {
            console.error("Failed to submit quiz attempt:", error);
            // Even if backend fails, we showed local results
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>Quiz not available yet. Coming soon!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    <p className="text-muted-foreground">Passing score: {quiz.passing_score}%</p>
                </div>
                {submitted && (
                    <div className={`text-xl font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
                        Score: {Math.round(score)}%
                    </div>
                )}
            </div>

            {quiz.questions?.map((question, index) => (
                <Card key={question.id} className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-start gap-2">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            {question.question_text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={answers[question.id]?.toString()}
                            onValueChange={(val) => handleOptionSelect(question.id, val)}
                        >
                            <div className="space-y-3">
                                {question.answers?.map((answer) => {
                                    const isSelected = answers[question.id] === answer.id;
                                    let itemStyle = "flex items-center space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition-colors hover:bg-accent/50";

                                    if (submitted) {
                                        if (answer.is_correct) {
                                            itemStyle += " border-green-500 bg-green-500/10";
                                        } else if (isSelected && !answer.is_correct) {
                                            itemStyle += " border-red-500 bg-red-500/10";
                                        }
                                    } else if (isSelected) {
                                        itemStyle += " border-primary bg-primary/5";
                                    }

                                    return (
                                        <div key={answer.id} className={itemStyle} onClick={() => handleOptionSelect(question.id, answer.id)}>
                                            <RadioGroupItem value={answer.id.toString()} id={`a-${answer.id}`} className="sr-only" />
                                            <div className="flex-1">
                                                <Label htmlFor={`a-${answer.id}`} className="cursor-pointer font-normal block w-full">
                                                    {answer.answer_text}
                                                </Label>
                                            </div>
                                            {submitted && answer.is_correct && <CheckCircle className="w-5 h-5 text-green-500" />}
                                            {submitted && isSelected && !answer.is_correct && <XCircle className="w-5 h-5 text-red-500" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}

            <div className="flex justify-end pt-4">
                {!submitted ? (
                    <Button
                        onClick={handleSubmit}
                        size="lg"
                        disabled={Object.keys(answers).length !== quiz.questions?.length}
                    >
                        Submit Quiz
                    </Button>
                ) : (
                    <Button onClick={() => {
                        setSubmitted(false);
                        setAnswers({});
                        setScore(0);
                        setPassed(false);
                    }} variant="outline">
                        Try Again
                    </Button>
                )}
            </div>
        </div>
    );
}
