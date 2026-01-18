"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Mic } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Project } from "@/types/project";

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

/**
 * Memoized project card to prevent unnecessary re-renders
 * Only re-renders when project data actually changes
 */
export const ProjectCard = memo(function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <Card
            onClick={onClick}
            className="hover:shadow-xl transition-all cursor-pointer hover:scale-105 bg-white/60 backdrop-blur-sm"
        >
            <CardHeader>
                <CardTitle className="font-serif text-2xl line-clamp-2">
                    {project.title}
                </CardTitle>
                <CardDescription className="font-sans flex items-center gap-2">
                    {project.genre && (
                        <>
                            <span>{project.genre}</span>
                            <span>•</span>
                        </>
                    )}
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(project.updatedAt.toDate(), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                        <div className="w-full bg-paper-dark rounded-full h-2 mb-2">
                            <div
                                className="bg-accent-primary h-2 rounded-full transition-all"
                                style={{
                                    width: `${Math.min((project.wordCount / 50000) * 100, 100)}%`,
                                }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-sm text-ink-light font-sans">
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {project.wordCount.toLocaleString()} words
                            </span>
                            <span className="text-ink/40">Goal: 50k</span>
                        </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                        <p className="text-sm text-ink-light font-sans line-clamp-2">
                            {project.description}
                        </p>
                    )}

                    {/* Continue Button */}
                    <div className="flex flex-col gap-3 mt-4">
                        <p className="text-[10px] uppercase tracking-widest text-ink/30 font-sans font-bold">
                            Install NPM dependencies:
                        </p>
                        <Button variant="secondary" className="w-full group">
                            <Mic className="h-4 w-4 mr-2 group-hover:text-accent-primary transition-colors" />
                            Continue Writing
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
