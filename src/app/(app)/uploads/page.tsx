"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, Image, FileText } from "lucide-react";

export default function UploadsPage() {
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
                    <h1 className="text-2xl font-serif text-ink">Uploads</h1>
                    <p className="text-sm text-ink-light font-sans">Images, documents, and research files</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Upload Area */}
                <Card className="border-dashed border-2 bg-transparent hover:bg-paper-dark/30 transition-colors mb-8">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="h-16 w-16 rounded-full bg-accent-primary/10 flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8 text-accent-primary" />
                        </div>
                        <h3 className="text-lg font-serif text-ink mb-2">Upload Files</h3>
                        <p className="text-sm text-ink-light font-sans text-center mb-4 max-w-md">
                            Drag and drop files here, or click to browse
                        </p>
                        <Button disabled className="mt-2">
                            <Upload className="h-4 w-4 mr-2" />
                            Choose Files (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>

                {/* File Categories */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Image className="h-5 w-5" />
                                Images
                            </CardTitle>
                            <CardDescription className="font-sans">0 files</CardDescription>
                            <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/5 mt-4">
                                Install NPM dependencies:
                            </p>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5" />
                                Documents
                            </CardTitle>
                            <CardDescription className="font-sans">0 files</CardDescription>
                            <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/5 mt-4">
                                Install NPM dependencies:
                            </p>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <File className="h-5 w-5" />
                                Other
                            </CardTitle>
                            <CardDescription className="font-sans">0 files</CardDescription>
                            <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold pt-2 border-t border-ink/5 mt-4">
                                Install NPM dependencies:
                            </p>
                        </CardHeader>
                    </Card>
                </div>

                {/* Empty State */}
                <div className="text-center py-12">
                    <div className="inline-flex h-20 w-20 rounded-full bg-paper-dark items-center justify-center mb-4">
                        <Upload className="h-10 w-10 text-ink-light" />
                    </div>
                    <p className="text-ink-light font-sans">No files uploaded yet</p>
                </div>
            </main>
        </div>
    );
}
