// benchmarks/search_benchmark.ts

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Project {
  id: string;
  title: string;
  chapters: Chapter[];
}

// Generate mock data
const NUM_PROJECTS = 5;
const CHAPTERS_PER_PROJECT = 50;
const CONTENT_LENGTH = 10000; // 10KB text per chapter

const projects: Project[] = [];
// Create a base string to simulate realistic content
const contentBase = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(CONTENT_LENGTH / 56);

for (let i = 0; i < NUM_PROJECTS; i++) {
  const chapters: Chapter[] = [];
  for (let j = 0; j < CHAPTERS_PER_PROJECT; j++) {
    chapters.push({
      id: `p${i}_c${j}`,
      title: `Chapter ${j} of Project ${i}`,
      content: contentBase + ` unique_string_${i}_${j}`,
      order: j
    });
  }
  projects.push({
    id: `p${i}`,
    title: `Project ${i}`,
    chapters
  });
}

console.log(`Generated ${NUM_PROJECTS} projects with ${CHAPTERS_PER_PROJECT} chapters each.`);
console.log(`Total chapters: ${NUM_PROJECTS * CHAPTERS_PER_PROJECT}`);
console.log(`Content size per chapter: ~${CONTENT_LENGTH} chars`);

const query = "unique_string_2_25";

// 1. Baseline: Pre-processing (Update cost)
console.log("\n--- Baseline: Pre-processing (Update cost) ---");
const startUpdate = performance.now();
let baselineResults;
for(let k=0; k<10; k++) { // Run multiple times to average/warmup
    const searchableChapters = [];
    for (const p of projects) {
        for (const c of p.chapters) {
            searchableChapters.push({
                chapter: c,
                project: p,
                searchString: (c.title + ' ' + c.content).toLowerCase()
            });
        }
    }
    if (k===9) baselineResults = searchableChapters;
}
const endUpdate = performance.now();
const baselineUpdateTime = (endUpdate - startUpdate) / 10;
console.log(`Baseline Update Time (avg 10 runs): ${baselineUpdateTime.toFixed(2)} ms`);


// 2. Baseline: Search (Search cost)
console.log("\n--- Baseline: Search (Search cost) ---");
const qLower = query.toLowerCase();

const startSearch = performance.now();
let searchCountBaseline = 0;
for(let k=0; k<100; k++) {
    const resultsBaseline: any[] = [];
    if (baselineResults) {
        for (let i = 0; i < baselineResults.length; i++) {
            if (baselineResults[i].searchString.includes(qLower)) {
                resultsBaseline.push(baselineResults[i]);
            }
        }
    }
    searchCountBaseline = resultsBaseline.length;
}
const endSearch = performance.now();
const baselineSearchTime = (endSearch - startSearch) / 100;
console.log(`Baseline Search Time (avg 100 runs): ${baselineSearchTime.toFixed(2)} ms`);
console.log(`Found: ${searchCountBaseline} matches`);


// 3. Optimized: No Pre-processing (Update cost)
console.log("\n--- Optimized: Regex (Update cost) ---");
const startUpdateOpt = performance.now();
let optResults;
for(let k=0; k<10; k++) {
    const searchableChaptersOpt = [];
    for (const p of projects) {
        for (const c of p.chapters) {
            searchableChaptersOpt.push({
                chapter: c,
                project: p
            });
        }
    }
    if (k===9) optResults = searchableChaptersOpt;
}
const endUpdateOpt = performance.now();
const optimizedUpdateTime = (endUpdateOpt - startUpdateOpt) / 10;
console.log(`Optimized Update Time (avg 10 runs): ${optimizedUpdateTime.toFixed(2)} ms`);


// 4. Optimized: Regex Search (Search cost)
console.log("\n--- Optimized: Regex (Search cost) ---");
const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(escapedQuery, 'i');

const startSearchOpt = performance.now();
let searchCountOpt = 0;
for(let k=0; k<100; k++) {
    const resultsOpt: any[] = [];
    if (optResults) {
        for (let i = 0; i < optResults.length; i++) {
            const item = optResults[i];
            if (regex.test(item.chapter.title) || regex.test(item.chapter.content)) {
                resultsOpt.push(item);
            }
        }
    }
    searchCountOpt = resultsOpt.length;
}
const endSearchOpt = performance.now();
const optimizedSearchTime = (endSearchOpt - startSearchOpt) / 100;
console.log(`Optimized Search Time (avg 100 runs): ${optimizedSearchTime.toFixed(2)} ms`);
console.log(`Found: ${searchCountOpt} matches`);

console.log("\n--- Summary ---");
console.log(`Update Improvement: ${(baselineUpdateTime / optimizedUpdateTime).toFixed(1)}x faster`);
console.log(`Search Impact: ${(optimizedSearchTime / baselineSearchTime).toFixed(1)}x slower`);
