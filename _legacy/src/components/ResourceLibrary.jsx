import React from 'react';
import { Book, FileText, Lightbulb, PenTool } from 'lucide-react';

const resources = [
    {
        id: 1,
        title: "The Hero's Journey Structure",
        category: "Structure",
        icon: <Book size={20} />,
        description: "A classic template for storytelling that involves a hero who goes on an adventure, learns a lesson, wins a victory, and returns home transformed."
    },
    {
        id: 2,
        title: "Developing Complex Characters",
        category: "Character",
        icon: <PenTool size={20} />,
        description: "Learn how to create characters with depth, flaws, and motivations that drive your plot forward."
    },
    {
        id: 3,
        title: "Show, Don't Tell",
        category: "Technique",
        icon: <FileText size={20} />,
        description: "Master the art of allowing readers to experience the story through action, words, thoughts, senses, and feelings rather than through the author’s exposition."
    },
    {
        id: 4,
        title: "Overcoming Writer's Block",
        category: "Mindset",
        icon: <Lightbulb size={20} />,
        description: "Practical strategies to get your creative juices flowing again when you feel stuck."
    }
];

const ResourceLibrary = () => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                    <div key={resource.id} className="glass-panel p-6 rounded-2xl hover:bg-[var(--bg-surface)] transition-all duration-300 group cursor-pointer border border-[var(--glass-border)] hover:border-[var(--accent-gold-dim)]">
                        <div className="w-12 h-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] flex items-center justify-center mb-4 text-[var(--accent-gold)] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                            {resource.icon}
                        </div>
                        <div className="mb-2">
                            <span className="text-xs font-bold tracking-wider text-[var(--accent-gold)] uppercase">{resource.category}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-gold)] transition-colors">{resource.title}</h3>
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{resource.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceLibrary;
