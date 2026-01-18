import React, { useState } from 'react';

const BookEditor = () => {
    const [title, setTitle] = useState('Untitled Masterpiece');
    const [content, setContent] = useState('');

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
            <div className="glass-panel p-8 rounded-2xl flex-1 flex flex-col relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-50"></div>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-transparent border-none text-3xl font-display font-bold text-[var(--text-primary)] focus:outline-none focus:ring-0 placeholder-[var(--text-muted)] mb-6 w-full"
                    placeholder="Chapter Title..."
                />

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 bg-transparent border-none resize-none text-lg text-[var(--text-secondary)] focus:outline-none focus:ring-0 leading-relaxed placeholder-[var(--text-muted)]/50 font-serif"
                    placeholder="Start writing your story here... Let your imagination flow."
                />

                <div className="mt-4 flex justify-between items-center text-xs text-[var(--text-muted)] border-t border-[var(--glass-border)] pt-4">
                    <span>{content.split(/\s+/).filter(w => w.length > 0).length} words</span>
                    <span>Last saved just now</span>
                </div>
            </div>
        </div>
    );
};

export default BookEditor;
