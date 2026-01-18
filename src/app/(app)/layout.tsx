import { AppBottomNav } from "@/components/manifesto/app-bottom-nav";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <AppBottomNav />
            {/* Add bottom padding on mobile to prevent content from being hidden behind nav */}
            <div className="h-16 md:hidden" />
        </>
    );
}
