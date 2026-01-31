
import { performance } from 'perf_hooks';
import { countWords } from '../utils/textUtils';

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Project {
  id: string;
  chapters: Chapter[];
  currentWordCount: number;
}

// Helper to generate some text
function generateText(words: number): string {
  return Array(words).fill("word").join(" ");
}

// Current (Old) Implementation
function currentUpdate(project: Project, chapterId: string, newContent: string): { updatedProject: Project, time: number } {
  const start = performance.now();

  const updatedChapters = project.chapters.map(c => c.id === chapterId ? { ...c, content: newContent } : c);
  // Uses countWords but maps over ALL chapters (O(N))
  const totalWords = updatedChapters.reduce((acc, curr) => acc + countWords(curr.content), 0);

  const updatedProject = { ...project, chapters: updatedChapters, currentWordCount: totalWords };

  const end = performance.now();
  return { updatedProject, time: end - start };
}

// Optimized Implementation
function optimizedUpdate(project: Project, chapterId: string, newContent: string): { updatedProject: Project, time: number } {
  const start = performance.now();

  const oldChapter = project.chapters.find(c => c.id === chapterId);
  if (!oldChapter) throw new Error("Chapter not found");

  const oldWordCount = countWords(oldChapter.content);
  const newWordCount = countWords(newContent);

  const updatedChapters = project.chapters.map(c => c.id === chapterId ? { ...c, content: newContent } : c);
  const totalWords = project.currentWordCount - oldWordCount + newWordCount;

  const updatedProject = { ...project, chapters: updatedChapters, currentWordCount: totalWords };

  const end = performance.now();
  return { updatedProject, time: end - start };
}

// Benchmark Setup
const NUM_CHAPTERS = 50;
const WORDS_PER_CHAPTER = 2000;
const TOTAL_WORDS = NUM_CHAPTERS * WORDS_PER_CHAPTER;

console.log(`Setting up benchmark with ${NUM_CHAPTERS} chapters, ${WORDS_PER_CHAPTER} words each. Total: ${TOTAL_WORDS} words.`);

const chapters: Chapter[] = [];
for (let i = 0; i < NUM_CHAPTERS; i++) {
  chapters.push({
    id: `ch_${i}`,
    title: `Chapter ${i}`,
    content: generateText(WORDS_PER_CHAPTER),
    order: i
  });
}

const project: Project = {
  id: 'p1',
  chapters: chapters,
  currentWordCount: TOTAL_WORDS
};

// Test
const targetChapterId = 'ch_25';
const newContent = generateText(WORDS_PER_CHAPTER + 10); // Added 10 words

// Warmup
currentUpdate(project, targetChapterId, newContent);
optimizedUpdate(project, targetChapterId, newContent);

// Run Benchmark
const ITERATIONS = 100;
let totalCurrentTime = 0;
let totalOptimizedTime = 0;

for (let i = 0; i < ITERATIONS; i++) {
  totalCurrentTime += currentUpdate(project, targetChapterId, newContent).time;
  totalOptimizedTime += optimizedUpdate(project, targetChapterId, newContent).time;
}

const avgCurrent = totalCurrentTime / ITERATIONS;
const avgOptimized = totalOptimizedTime / ITERATIONS;

console.log(`\nResults over ${ITERATIONS} iterations:`);
console.log(`Old Implementation Avg Time: ${avgCurrent.toFixed(4)} ms`);
console.log(`New Implementation Avg Time: ${avgOptimized.toFixed(4)} ms`);
console.log(`Improvement: ${(avgCurrent / avgOptimized).toFixed(2)}x faster`);

// Verify Correctness
const resultCurrent = currentUpdate(project, targetChapterId, newContent).updatedProject;
const resultOptimized = optimizedUpdate(project, targetChapterId, newContent).updatedProject;

if (resultCurrent.currentWordCount === resultOptimized.currentWordCount) {
    console.log(`\nCorrectness Check: PASSED (Word Count: ${resultCurrent.currentWordCount})`);
} else {
    console.log(`\nCorrectness Check: FAILED`);
    console.log(`Old: ${resultCurrent.currentWordCount}`);
    console.log(`New: ${resultOptimized.currentWordCount}`);
}
