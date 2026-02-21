
import { Project, PersonaType, Chapter, Message, Milestone, Interaction } from '../types';

// Simple mock for performance.now() if running in environment without it (though node has it)
const now = () => performance.now();

// Generate a large project list
const generateLargeProjectList = (count: number): any[] => {
  const projects: Project[] = [];
  for (let i = 0; i < count; i++) {
    projects.push({
      id: `project-${i}`,
      userId: `user-${i % 5}`,
      title: `Project Title ${i}`,
      genre: 'Science Fiction',
      persona: 'empathetic',
      creativityLevel: 'balanced',
      targetWordCount: 50000,
      currentWordCount: 12000,
      soulSummary: "A long summary ".repeat(50),
      lastInteractionSummary: "Another long summary ".repeat(20),
      chapters: Array.from({ length: 10 }, (_, j) => ({
        id: `ch-${i}-${j}`,
        title: `Chapter ${j}`,
        content: "Content ".repeat(100),
        order: j
      })),
      messages: Array.from({ length: 20 }, (_, j) => ({
        id: `msg-${i}-${j}`,
        role: j % 2 === 0 ? 'user' : 'assistant',
        content: "Message content ".repeat(10),
        timestamp: new Date()
      })),
      milestones: [],
      interactions: [],
      updatedAt: new Date(),
      orientationDone: true
    });
  }
  return projects;
};

const runBenchmark = () => {
  const projectCount = 50; // Adjust to simulate a heavy user or many small projects
  console.log(`Generating ${projectCount} projects...`);
  const projects = generateLargeProjectList(projectCount);
  const jsonString = JSON.stringify(projects);
  const jsonString2 = JSON.stringify(projects); // Identical string, different reference

  console.log(`JSON String length: ${(jsonString.length / 1024 / 1024).toFixed(2)} MB`);

  const iterations = 100;

  // Baseline: Always Parse
  let start = now();
  for (let i = 0; i < iterations; i++) {
    const parsed = JSON.parse(jsonString);
    if (parsed.length !== projectCount) throw new Error("Parse error");
  }
  const baselineTime = now() - start;
  console.log(`Baseline (Always Parse): ${baselineTime.toFixed(2)}ms for ${iterations} iterations`);
  console.log(`Average per parse: ${(baselineTime / iterations).toFixed(2)}ms`);

  // Optimization: Check string equality first
  let cachedString: string | null = null;
  let cachedParsed: Project[] | null = null;

  start = now();
  for (let i = 0; i < iterations; i++) {
    // Simulate reading from storage (string is same content)
    const currentString = jsonString2;

    let parsed: Project[];
    if (cachedString === currentString) {
        parsed = cachedParsed!;
    } else {
        parsed = JSON.parse(currentString);
        cachedString = currentString;
        cachedParsed = parsed;
    }
    if (parsed.length !== projectCount) throw new Error("Parse error");
  }
  const optimizedTime = now() - start;
  console.log(`Optimized (Check String Equality): ${optimizedTime.toFixed(2)}ms for ${iterations} iterations`);
  console.log(`Average per operation: ${(optimizedTime / iterations).toFixed(2)}ms`);

  console.log(`Speedup: ${(baselineTime / optimizedTime).toFixed(2)}x`);
};

runBenchmark();
