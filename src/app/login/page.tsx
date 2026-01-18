"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function LoginPage() {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center bg-paper p-4">
            <Card className="w-full max-w-md border-none shadow-xl bg-white/50 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto relative h-40 w-40 mb-2">
                        <Image
                            src="/logo-v2.png"
                            alt="Mi Manifesto Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    {/* <CardTitle className="text-4xl font-serif text-ink">Mi Manifesto</CardTitle> */}
                    <CardDescription className="text-lg text-ink-light font-sans">
                        Your voice, your story, your book.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <Button
                        variant="default"
                        size="lg"
                        className="w-full text-lg h-14 bg-ink hover:bg-ink-light transition-all rounded-full"
                        onClick={signInWithGoogle}
                    >
                        Continue with Google
                    </Button>
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-ink/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-transparent px-2 text-ink/40 font-sans">Or sign in with email</span>
                        </div>
                    </div>
                    {/* Email login would go here, placeholder for now */}
                    <div className="grid gap-3">
                        <input
                            type="email"
                            placeholder="Email address"
                            className="flex h-12 w-full rounded-full border border-ink/10 bg-white/50 px-4 py-1 text-sm shadow-sm transition-colors placeholder:text-ink/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="flex h-12 w-full rounded-full border border-ink/10 bg-white/50 px-4 py-1 text-sm shadow-sm transition-colors placeholder:text-ink/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled
                        />
                        <Button variant="outline" className="w-full h-12 rounded-full border-ink/10 text-ink/50" disabled>
                            Sign In (Coming Soon)
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-ink/30 font-sans">
                    <p className="text-[10px] uppercase tracking-widest font-bold">
                        Install NPM dependencies:
                    </p>
                    <p>By continuing, you agree to our Terms of Service.</p>
                </CardFooter>
            </Card>
        </div>
    );
}
