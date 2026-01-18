"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { CreateProjectModal } from "@/components/manifesto/create-project-modal";
import { ProjectCard } from "@/components/ui/project-card";

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const { projects, loading: projectsLoading } = useProjects();
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            {/* Header */}
            <header className="border-b border-ink/10 bg-white/40 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <BookOpen className="h-6 w-6 text-accent-primary" />
                        <h1 className="text-xl md:text-2xl font-serif text-ink">Mi Manifesto</h1>
                    </div>
                    <Button variant="outline" onClick={signOut} className="text-sm">
                        Sign Out
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
                <div className="mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif text-ink mb-2">
                        Welcome back, {user.displayName?.split(' ')[0] || 'Author'}
                    </h2>
                    <p className="text-ink-light font-sans text-lg">Ready to continue your story?</p>
                </div>

                {/* Projects Grid */}
                {projectsLoading || authLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="bg-white/40 border border-ink/5 overflow-hidden">
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-ink/5 rounded-md w-3/4 animate-pulse"></div>
                                    <div className="h-4 bg-ink/5 rounded-md w-1/2 animate-pulse"></div>
                                    <div className="pt-4 space-y-3">
                                        <div className="h-2 bg-ink/5 rounded-full w-full animate-pulse"></div>
                                        <div className="flex justify-between">
                                            <div className="h-3 bg-ink/5 rounded-md w-1/4 animate-pulse"></div>
                                            <div className="h-3 bg-ink/5 rounded-md w-1/4 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <div className="h-2 bg-ink/5 rounded-md w-1/3 animate-pulse mb-2"></div>
                                        <div className="h-10 bg-ink/5 rounded-md w-full animate-pulse"></div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Create New Project Card */}
                        <Card
                            onClick={() => setShowCreateModal(true)}
                            className="border-dashed border-2 bg-transparent hover:bg-paper-dark/50 cursor-pointer transition-all flex flex-col items-center justify-center h-64 group hover:scale-105"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center group-hover:bg-ink group-hover:text-paper transition-all">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <span className="block font-serif text-xl text-ink">New Book</span>
                                    <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold mt-2">
                                        Install NPM dependencies:
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Project Cards */}
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => router.push(`/project/${project.id}`)}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!projectsLoading && projects.length === 0 && (
                    <div className="text-center py-16">
                        <div className="inline-flex h-20 w-20 rounded-full bg-accent-primary/10 items-center justify-center mb-6">
                            <BookOpen className="h-10 w-10 text-accent-primary" />
                        </div>
                        <h3 className="text-2xl font-serif text-ink mb-3">Your writing journey begins here</h3>
                        <p className="text-ink-light font-sans mb-8 max-w-md mx-auto">
                            Create your first book project and start turning your voice into a published manuscript.
                        </p>
                        <Button
                            onClick={() => setShowCreateModal(true)}
                            size="lg"
                            className="bg-ink hover:bg-ink/90 text-paper"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Create Your First Book
                        </Button>
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            <CreateProjectModal open={showCreateModal} onOpenChange={setShowCreateModal} />
        </div>
    );
}
