import React from 'react';
import { BookOpen, Library, Mic, Settings, Menu } from 'lucide-react';

const Layout = ({ children, activeTab, onTabChange }) => {
    return (
        <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-20 lg:w-64 flex-shrink-0 border-r border-[var(--glass-border)] bg-[var(--bg-secondary)] flex flex-col items-center lg:items-stretch py-6 transition-all duration-300">
                <div className="mb-10 px-4 flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-dim)] flex items-center justify-center shadow-[0_0_15px_var(--accent-gold-glow)]">
                        <span className="font-display font-bold text-black text-xl">M</span>
                    </div>
                    <span className="hidden lg:block font-display font-bold text-xl tracking-tight">Manifesto</span>
                </div>

                <nav className="flex-1 w-full px-2 lg:px-4 space-y-2">
                    <NavItem
                        icon={<BookOpen size={24} />}
                        label="Write"
                        active={activeTab === 'write'}
                        onClick={() => onTabChange('write')}
                    />
                    <NavItem
                        icon={<Library size={24} />}
                        label="Resources"
                        active={activeTab === 'resources'}
                        onClick={() => onTabChange('resources')}
                    />
                    <NavItem
                        icon={<Settings size={24} />}
                        label="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => onTabChange('settings')}
                    />
                </nav>

                <div className="mt-auto px-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--glass-border)] hidden lg:block">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-[var(--text-secondary)]">Agent Active</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">Muse is ready to help.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b border-[var(--glass-border)] bg-[var(--bg-primary)]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
                    <h2 className="font-display font-semibold text-lg">
                        {activeTab === 'write' && 'Your Masterpiece'}
                        {activeTab === 'resources' && 'Knowledge Base'}
                        {activeTab === 'settings' && 'Preferences'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            <span className="sr-only">Profile</span>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
                        </button>
                    </div>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
                    {children}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-[var(--bg-surface)] text-[var(--accent-gold)] shadow-[0_0_10px_rgba(0,0,0,0.2)] border border-[var(--glass-border)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]'
            }`}
    >
        <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
        </div>
        <span className="hidden lg:block font-medium">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] hidden lg:block shadow-[0_0_8px_var(--accent-gold)]"></div>}
    </button>
);

export default Layout;
