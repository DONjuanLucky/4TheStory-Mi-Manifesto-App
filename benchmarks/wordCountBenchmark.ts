
import { performance } from 'perf_hooks';
import { countWords } from '../utils/textUtils';

// Mock types
interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Project {
  id: string;
  userId: string;
  title: string;
  genre: string;
  persona: string;
  creativityLevel: string;
  targetWordCount: number;
  currentWordCount: number;
  soulSummary: string;
  chapters: Chapter[];
  messages: any[];
  milestones: any[];
  interactions: any[];
  updatedAt: Date;
  orientationDone: boolean;
}

// Helper to generate random words
function generateWords(count: number): string {
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
  let result = '';
  for (let i = 0; i < count; i++) {
    result += words[Math.floor(Math.random() * words.length)] + ' ';
  }
  return result.trim();
}

// Create a large project
const chapters: Chapter[] = [];
const numChapters = 50;
const wordsPerChapter = 2000;

for (let i = 0; i < numChapters; i++) {
  chapters.push({
    id: `c${i}`,
    title: `Chapter ${i + 1}`,
    content: generateWords(wordsPerChapter),
    order: i + 1,
  });
}

const activeProject: Project = {
  id: 'p1',
  userId: 'u1',
  title: 'Test Project',
  genre: 'Fiction',
  persona: 'empathetic',
  creativityLevel: 'balanced',
  targetWordCount: 50000,
  currentWordCount: numChapters * wordsPerChapter,
  soulSummary: 'Test Summary',
  chapters: chapters,
  messages: [],
  milestones: [],
  interactions: [],
  updatedAt: new Date(),
  orientationDone: true,
};

// Original inefficient implementation (replicates previous App.tsx logic)
function updateChapterOriginal(projectId: string, chapterId: string, content: string) {
    const updatedChapters = activeProject.chapters.map(c => c.id === chapterId ? { ...c, content } : c);
    const totalWords = updatedChapters.reduce((acc, curr) => acc + curr.content.trim().split(/\s+/).filter(Boolean).length, 0);
    return totalWords;
}

// Optimized implementation using countWords and differential update
function updateChapterOptimized(projectId: string, chapterId: string, content: string) {
    const oldChapter = activeProject.chapters.find(c => c.id === chapterId);
    if (!oldChapter) return activeProject.currentWordCount;

    const oldWordCount = countWords(oldChapter.content);
    const newWordCount = countWords(content);
    const diff = newWordCount - oldWordCount;

    const totalWords = activeProject.currentWordCount + diff;
    return totalWords;
}


// Benchmark
const iterations = 100;
const targetChapterId = 'c0'; // Update first chapter
const newContentBase = chapters[0].content;

console.log(`Starting benchmark with ${numChapters} chapters, ~${wordsPerChapter} words each.`);
console.log(`Total words: ${activeProject.currentWordCount}`);
console.log(`Iterations: ${iterations}`);

// Measure Original
const startOriginal = performance.now();
for (let i = 0; i < iterations; i++) {
    const newContent = newContentBase + ' word';
    updateChapterOriginal(activeProject.id, targetChapterId, newContent);
}
const endOriginal = performance.now();
const timeOriginal = endOriginal - startOriginal;
console.log(`Original Implementation Time: ${timeOriginal.toFixed(2)}ms`);


// Measure Optimized
const startOptimized = performance.now();
for (let i = 0; i < iterations; i++) {
    const newContent = newContentBase + ' word';
    updateChapterOptimized(activeProject.id, targetChapterId, newContent);
}
const endOptimized = performance.now();
const timeOptimized = endOptimized - startOptimized;

console.log(`Optimized Implementation Time: ${timeOptimized.toFixed(2)}ms`);
console.log(`Improvement: ${(timeOriginal / timeOptimized).toFixed(2)}x faster`);

// Verification
const originalResult = updateChapterOriginal(activeProject.id, targetChapterId, newContentBase + ' word');
const optimizedResult = updateChapterOptimized(activeProject.id, targetChapterId, newContentBase + ' word');
console.log(`\nVerification:`);
console.log(`Original Result: ${originalResult}`);
console.log(`Optimized Result: ${optimizedResult}`);
if (originalResult === optimizedResult) {
    console.log(`SUCCESS: Results match.`);
} else {
    console.error(`FAILURE: Results do not match!`);
}
