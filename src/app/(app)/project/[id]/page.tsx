"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/types/project";
import { useProjects } from "@/hooks/useProjects";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Word count helper
function countWords(text: string): number {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function ProjectEditorPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [justSaved, setJustSaved] = useState(false);

    const { updateProject } = useProjects();

    // Load project
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        if (user && projectId) {
            const loadProject = async () => {
                try {
                    const docRef = doc(db, "projects", projectId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
                        setProject(projectData);
                        setContent(projectData.content || "");
                        setLoading(false);
                    } else {
                        console.error("Project not found");
                        router.push("/dashboard");
                    }
                } catch (error) {
                    console.error("Error loading project:", error);
                    router.push("/dashboard");
                }
            };

            loadProject();
        }
    }, [user, authLoading, projectId, router]);

    // Auto-save with debounce (5 seconds to reduce Firestore writes)
    useEffect(() => {
        if (!project || content === project.content) return;

        const timer = setTimeout(async () => {
            setSaving(true);
            setJustSaved(false);

            try {
                await updateProject(projectId, {
                    content,
                    wordCount: countWords(content),
                });

                setSaving(false);
                setJustSaved(true);

                setTimeout(() => setJustSaved(false), 2000);
            } catch (error) {
                console.error("Error saving:", error);
                setSaving(false);
            }
        }, 5000); // Increased from 2s to 5s

        return () => clearTimeout(timer);
    }, [content, project, projectId, updateProject]);

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="animate-pulse">Loading project...</div>
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const wordCount = useMemo(() => countWords(content), [content]);

    return (
        <div className="min-h-screen bg-paper flex flex-col pb-20">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-sm border-b border-ink/10 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/dashboard")}
                            className="gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <div>
                            <h1 className="font-serif text-xl md:text-2xl text-ink line-clamp-1">
                                {project.title}
                            </h1>
                            <p className="text-sm text-ink-light font-sans">
                                {wordCount.toLocaleString()} words
                            </p>
                        </div>
                    </div>

                    {/* Save Status */}
                    <div className="flex items-center gap-2 text-sm">
                        {saving && (
                            <span className="text-ink-light font-sans flex items-center gap-2">
                                <Save className="h-4 w-4 animate-pulse" />
                                Saving...
                            </span>
                        )}
                        {justSaved && (
                            <span className="text-green-600 font-sans flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Saved
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Editor */}
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your story..."
                    className="w-full h-[calc(100vh-200px)] resize-none bg-transparent border-none focus:outline-none focus:ring-0 font-serif text-lg leading-relaxed text-ink placeholder:text-ink/30"
                    autoFocus
                />
            </main>
        </div>
    );
}
