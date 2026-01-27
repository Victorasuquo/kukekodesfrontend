import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Plus, Users } from 'lucide-react';

export function Forum() {
    return (
        <div className="space-y-6 pt-16">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Community Forum</h2>
                    <p className="text-muted-foreground">Connect with other learners and share knowledge.</p>
                </div>
                <Button disabled>
                    <Plus className="w-4 h-4 mr-2" /> New Thread
                </Button>
            </div>

            <Card className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    The community forum is being built. Soon you'll be able to discuss courses,
                    ask questions, and connect with fellow learners.
                </p>
            </Card>

            {/* Feature preview cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Discussions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Ask questions and get help from the community on any topic.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Study Groups
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Join study groups to learn together with peers.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" />
                            Share Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Showcase your projects and get feedback from instructors.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
