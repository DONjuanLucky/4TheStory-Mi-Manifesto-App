"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Project, CreateProjectData } from "@/types/project";

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        const startTime = performance.now();
        console.log("[useProjects] Effect started, user:", user?.uid, "authLoading:", authLoading);

        if (!user) {
            // Only clear projects if auth has finished and there's no user
            if (!authLoading) {
                setProjects([]);
                setLoading(false);

            }
            return;
        }


        const projectsRef = collection(db, "projects");
        const q = query(
            projectsRef,
            where("userId", "==", user.uid),
            orderBy("updatedAt", "desc"),
            limit(20) // Only load 20 most recent projects
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {

            const projectData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];
            setProjects(projectData);
            setLoading(false);
        }, (error) => {
            console.error("Error loading projects:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    const createProject = useCallback(async (data: CreateProjectData): Promise<string> => {
        if (!user) throw new Error("User not authenticated");

        const startTime = performance.now();
        console.log("[createProject] Starting...");

        const projectData = {
            userId: user.uid,
            title: data.title,
            description: data.description || "",
            genre: data.genre || "",
            content: "",
            wordCount: 0,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        console.log("[createProject] Data prepared in", performance.now() - startTime, "ms");
        const beforeFirestore = performance.now();

        const docRef = await addDoc(collection(db, "projects"), projectData);

        console.log("[createProject] Firestore write took", performance.now() - beforeFirestore, "ms");
        console.log("[createProject] Total time:", performance.now() - startTime, "ms");

        return docRef.id;
    }, [user]);

    const updateProject = useCallback(async (
        projectId: string,
        updates: Partial<Omit<Project, "id" | "userId" | "createdAt">>
    ) => {
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, {
            ...updates,
            updatedAt: Timestamp.now(),
        });
    }, []);

    const deleteProject = useCallback(async (projectId: string) => {
        const projectRef = doc(db, "projects", projectId);
        await deleteDoc(projectRef);
    }, []);

    return useMemo(() => ({
        projects,
        loading,
        createProject,
        updateProject,
        deleteProject,
    }), [projects, loading, createProject, updateProject, deleteProject]);
}
