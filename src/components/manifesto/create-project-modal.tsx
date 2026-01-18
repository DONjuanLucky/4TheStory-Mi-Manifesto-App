"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/hooks/useProjects";
import { Loader2 } from "lucide-react";

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const genres = [
    "Fiction",
    "Non-Fiction",
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Thriller",
    "Romance",
    "Memoir",
    "Biography",
    "Self-Help",
    "Other",
];

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [creating, setCreating] = useState(false);
    const { createProject } = useProjects();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setCreating(true);
        try {
            const projectId = await createProject({
                title: title.trim(),
                description: description.trim(),
                genre: genre || undefined,
            });

            // Reset form and close modal
            setTitle("");
            setDescription("");
            setGenre("");
            onOpenChange(false);

            // Navigate immediately
            router.push(`/project/${projectId}`);
            setCreating(false);
        } catch (error) {
            console.error("Error creating project:", error);
            alert("Failed to create project. Please try again.");
            setCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-paper border-ink/10">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-serif text-ink">
                        Start a New Book
                    </DialogTitle>
                    <DialogDescription className="font-sans text-ink-light">
                        Give your story a title to begin your writing journey.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-sans text-ink">
                            Book Title *
                        </Label>
                        <Input
                            id="title"
                            placeholder="The Mountains Were Silent"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="font-serif text-lg"
                            disabled={creating}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-sans text-ink">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="A story about..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="font-sans resize-none"
                            disabled={creating}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="genre" className="font-sans text-ink">
                            Genre (Optional)
                        </Label>
                        <Select value={genre} onValueChange={setGenre} disabled={creating}>
                            <SelectTrigger className="font-sans">
                                <SelectValue placeholder="Select a genre" />
                            </SelectTrigger>
                            <SelectContent>
                                {genres.map((g) => (
                                    <SelectItem key={g} value={g} className="font-sans">
                                        {g}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={creating}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || creating}
                            className="flex-1 bg-ink hover:bg-ink/90 text-paper"
                        >
                            {creating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Book"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
