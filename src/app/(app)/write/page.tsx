"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, FileText, Sparkles } from "lucide-react";

export default function WritingPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { projects, loading: projectsLoading } = useProjects();
    const [selectedProject, setSelectedProject] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        // Auto-select most recent project
        if (projects.length > 0 && !selectedProject) {
            setSelectedProject(projects[0].id);
        }
    }, [projects, selectedProject]);

    if (authLoading || projectsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center p-4">
                <Card className="max-w-md bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="font-serif text-2xl">No Projects Yet</CardTitle>
                        <CardDescription className="font-sans">
                            Create your first book project to start writing
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => router.push("/dashboard")} className="w-full">
                            Go to Projects
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentProject = projects.find((p) => p.id === selectedProject) || projects[0];

    return (
        <div className="min-h-screen bg-paper pb-20">
            {/* Header with Project Selector */}
            <header className="bg-white/95 backdrop-blur-sm border-b border-ink/10 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <select
                        value={selectedProject || ""}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full md:w-auto font-serif text-xl border-none bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-primary rounded-lg px-2 py-1"
                    >
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.title}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-ink-light font-sans mt-1">
                        {currentProject.wordCount.toLocaleString()} words
                    </p>
                </div>
            </header>

            {/* Writing Modes */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Voice Mode Card */}
                    <Card className="hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-accent-primary/5 to-accent-light/5 border-accent-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-full bg-accent-primary/20 flex items-center justify-center">
                                    <Mic className="h-6 w-6 text-accent-primary" />
                                </div>
                                <div>
                                    <CardTitle className="font-serif text-xl">Voice Recording</CardTitle>
                                    <CardDescription className="font-sans">Speak your story</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-ink-light text-sm font-sans mb-4">
                                Record your voice and watch it transform into written text. The easiest way to write.
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold mb-3 pt-2 border-t border-accent-primary/10">
                                Install NPM dependencies:
                            </p>
                            <Button className="w-full group-hover:scale-105 transition-transform" disabled>
                                <Mic className="h-4 w-4 mr-2" />
                                Start Recording (Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Manual Writing Card */}
                    <Card className="hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="font-serif text-xl">Manual Editor</CardTitle>
                                    <CardDescription className="font-sans">Type and edit</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-ink-light text-sm font-sans mb-4">
                                Use the traditional text editor with formatting tools and instant saving.
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold mb-3 pt-2 border-t border-blue-200/30">
                                Install NPM dependencies:
                            </p>
                            <Button className="w-full group-hover:scale-105 transition-transform bg-blue-600 hover:bg-blue-700" disabled>
                                <FileText className="h-4 w-4 mr-2" />
                                Open Editor (Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>

                    {/* AI Assistant Card */}
                    <Card className="hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Sparkles className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <CardTitle className="font-serif text-xl">AI Writing Companion</CardTitle>
                                    <CardDescription className="font-sans">Get help and suggestions</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-ink-light text-sm font-sans mb-4">
                                Chat with an empathetic AI that helps you brainstorm, overcome writer's block, and refine your story.
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold mb-3 pt-2 border-t border-purple-200/30">
                                Install NPM dependencies:
                            </p>
                            <Button className="w-full group-hover:scale-105 transition-transform bg-purple-600 hover:bg-purple-700" disabled>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Chat with AI (Coming Soon)
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-serif text-ink mb-1">
                                {currentProject.wordCount.toLocaleString()}
                            </div>
                            <div className="text-sm text-ink-light font-sans mb-2">Words</div>
                            <p className="text-[8px] uppercase tracking-widest text-ink/20 font-sans font-bold pt-1 border-t border-ink/5">
                                Install NPM dependencies:
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-serif text-ink mb-1">
                                {Math.round((currentProject.wordCount / 50000) * 100)}%
                            </div>
                            <div className="text-sm text-ink-light font-sans mb-2">Complete</div>
                            <p className="text-[8px] uppercase tracking-widest text-ink/20 font-sans font-bold pt-1 border-t border-ink/5">
                                Install NPM dependencies:
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="text-center">
                        <CardContent className="pt-6">
                            <div className="text-3xl font-serif text-ink mb-1">0</div>
                            <div className="text-sm text-ink-light font-sans mb-2">Sessions</div>
                            <p className="text-[8px] uppercase tracking-widest text-ink/20 font-sans font-bold pt-1 border-t border-ink/5">
                                Install NPM dependencies:
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
