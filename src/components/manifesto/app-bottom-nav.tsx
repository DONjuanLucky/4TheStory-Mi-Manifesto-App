"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Pen, Upload, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        name: "Projects",
        href: "/dashboard",
        icon: BookOpen,
    },
    {
        name: "Writing",
        href: "/write",
        icon: Pen,
    },
    {
        name: "Uploads",
        href: "/uploads",
        icon: Upload,
    },
    {
        name: "Community",
        href: "/community",
        icon: Users,
    },
];

export function AppBottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-ink/10 z-50 md:hidden">
            <div className="flex items-center justify-around h-16 px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]",
                                isActive
                                    ? "text-accent-primary"
                                    : "text-ink-light hover:text-ink"
                            )}
                        >
                            <Icon className={cn("h-6 w-6", isActive && "scale-110")} />
                            <span
                                className={cn(
                                    "text-xs font-sans",
                                    isActive ? "font-semibold" : "font-normal"
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
