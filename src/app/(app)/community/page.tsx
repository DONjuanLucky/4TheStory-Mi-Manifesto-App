"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, MessageCircle, BookOpen } from "lucide-react";

export default function CommunityPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper pb-20">
            <header className="bg-white/95 backdrop-blur-sm border-b border-ink/10 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-serif text-ink">Community</h1>
                    <p className="text-sm text-ink-light font-sans">Connect with fellow writers</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Coming Soon Message */}
                <div className="text-center py-16">
                    <div className="inline-flex h-24 w-24 rounded-full bg-accent-primary/10 items-center justify-center mb-6">
                        <Users className="h-12 w-12 text-accent-primary" />
                    </div>
                    <h2 className="text-3xl font-serif text-ink mb-4">Community Coming Soon</h2>
                    <p className="text-ink-light font-sans max-w-md mx-auto mb-8">
                        We're building a space for you to share your work, connect with other writers, and get feedback from the community.
                    </p>

                    {/* Feature Preview */}
                    <div className="grid md:grid-cols-3 gap-4 mt-12">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                        <Heart className="h-6 w-6 text-red-600" />
                                    </div>
                                    <span className="text-lg">Share Excerpts</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-ink-light font-sans text-center mb-4">
                                    Share snippets of your work and get reactions
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold text-center pt-2 border-t border-ink/5">
                                    Install NPM dependencies:
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <MessageCircle className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <span className="text-lg">Get Feedback</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-ink-light font-sans text-center mb-4">
                                    Receive constructive comments from fellow authors
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold text-center pt-2 border-t border-ink/5">
                                    Install NPM dependencies:
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex flex-col items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                        <BookOpen className="h-6 w-6 text-green-600" />
                                    </div>
                                    <span className="text-lg">Discover Stories</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-ink-light font-sans text-center mb-4">
                                    Read and enjoy works from the Mi Manifesto community
                                </p>
                                <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold text-center pt-2 border-t border-ink/5">
                                    Install NPM dependencies:
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
