export const mockUser = {
  id: "user_1",
  name: "John Smith",
  email: "john@example.com",
  image: null,
  isPro: false,
};

export const mockItemTypes = [
  { id: "type_snippet", name: "Snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { id: "type_prompt", name: "Prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "Command", icon: "Terminal", color: "#f97316", isSystem: true },
  { id: "type_note", name: "Note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { id: "type_link", name: "Link", icon: "Link", color: "#10b981", isSystem: true },
  { id: "type_file", name: "File", icon: "File", color: "#6b7280", isSystem: true },
  { id: "type_image", name: "Image", icon: "Image", color: "#ec4899", isSystem: true },
];

export const mockCollections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and best practices",
    isFavorite: true,
    itemCount: 12,
    dominantTypeId: "type_snippet",
  },
  {
    id: "col_2",
    name: "AI Prompts",
    description: "Useful prompts for coding assistants",
    isFavorite: false,
    itemCount: 8,
    dominantTypeId: "type_prompt",
  },
  {
    id: "col_3",
    name: "Interview Prep",
    description: "Technical interview questions and notes",
    isFavorite: true,
    itemCount: 24,
    dominantTypeId: "type_note",
  },
  {
    id: "col_4",
    name: "DevOps Commands",
    description: "Docker, k8s, and deployment commands",
    isFavorite: false,
    itemCount: 16,
    dominantTypeId: "type_command",
  },
  {
    id: "col_5",
    name: "Useful Links",
    description: "Documentation and resources",
    isFavorite: false,
    itemCount: 32,
    dominantTypeId: "type_link",
  },
  {
    id: "col_6",
    name: "Python Snippets",
    description: "Python utilities and helpers",
    isFavorite: false,
    itemCount: 9,
    dominantTypeId: "type_snippet",
  },
];

export const mockItems = [
  {
    id: "item_1",
    title: "useDebounce Hook",
    contentType: "text" as const,
    itemTypeId: "type_snippet",
    content: `import { useState, useEffect } from 'react';
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}`,
    language: "typescript",
    tags: ["hooks", "debounce"],
    isFavorite: true,
    isPinned: true,
    lastUsedAt: "2026-05-30T10:00:00Z",
    createdAt: "2026-05-01T10:00:00Z",
    collectionIds: ["col_1"],
  },
  {
    id: "item_2",
    title: "Docker Cleanup",
    contentType: "text" as const,
    itemTypeId: "type_command",
    content: `# Remove all stopped containers
docker container prune -f
# Remove unused images
docker image prune -a -f
# Remove unused volumes
docker volume prune -f`,
    language: "bash",
    tags: ["docker", "cleanup", "devops"],
    isFavorite: false,
    isPinned: true,
    lastUsedAt: "2026-05-29T14:00:00Z",
    createdAt: "2026-04-15T09:00:00Z",
    collectionIds: ["col_4"],
  },
  {
    id: "item_3",
    title: "Tailwind CSS Docs",
    contentType: "url" as const,
    itemTypeId: "type_link",
    content: null,
    url: "https://tailwindcss.com/docs",
    language: null,
    tags: ["css", "tailwind", "documentation"],
    isFavorite: true,
    isPinned: true,
    lastUsedAt: "2026-05-31T08:00:00Z",
    createdAt: "2026-03-10T11:00:00Z",
    collectionIds: ["col_5"],
  },
  {
    id: "item_4",
    title: "React Query Setup",
    contentType: "text" as const,
    itemTypeId: "type_snippet",
    content: `import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}`,
    language: "typescript",
    tags: ["react", "react-query", "setup"],
    isFavorite: false,
    isPinned: false,
    lastUsedAt: "2026-05-28T16:00:00Z",
    createdAt: "2026-04-20T13:00:00Z",
    collectionIds: ["col_1"],
  },
  {
    id: "item_5",
    title: "Code Review Prompt",
    contentType: "text" as const,
    itemTypeId: "type_prompt",
    content: `Review the following code for:
- Security vulnerabilities
- Performance issues
- Code clarity and readability
- Edge cases not handled
Provide specific, actionable feedback with examples.`,
    language: null,
    tags: ["code-review", "ai", "prompts"],
    isFavorite: true,
    isPinned: false,
    lastUsedAt: "2026-05-30T11:00:00Z",
    createdAt: "2026-05-05T09:00:00Z",
    collectionIds: ["col_2"],
  },
  {
    id: "item_6",
    title: "Big O Cheat Sheet",
    contentType: "text" as const,
    itemTypeId: "type_note",
    content: `## Time Complexity
- O(1) — Constant: array access, hash lookup
- O(log n) — Logarithmic: binary search
- O(n) — Linear: array traversal
- O(n log n) — Merge sort, quicksort (avg)
- O(n²) — Bubble sort, nested loops`,
    language: null,
    tags: ["algorithms", "interview", "cheatsheet"],
    isFavorite: false,
    isPinned: false,
    lastUsedAt: "2026-05-27T10:00:00Z",
    createdAt: "2026-04-01T14:00:00Z",
    collectionIds: ["col_3"],
  },
  {
    id: "item_7",
    title: "kubectl Get Pods",
    contentType: "text" as const,
    itemTypeId: "type_command",
    content: `kubectl get pods --all-namespaces -o wide`,
    language: "bash",
    tags: ["kubernetes", "kubectl", "devops"],
    isFavorite: false,
    isPinned: false,
    lastUsedAt: "2026-05-26T15:00:00Z",
    createdAt: "2026-03-22T10:00:00Z",
    collectionIds: ["col_4"],
  },
  {
    id: "item_8",
    title: "Python List Comprehension",
    contentType: "text" as const,
    itemTypeId: "type_snippet",
    content: `# Filter and transform in one line
evens_squared = [x**2 for x in range(20) if x % 2 == 0]

# Nested comprehension
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]`,
    language: "python",
    tags: ["python", "comprehension"],
    isFavorite: false,
    isPinned: false,
    lastUsedAt: "2026-05-25T12:00:00Z",
    createdAt: "2026-04-10T08:00:00Z",
    collectionIds: ["col_6"],
  },
  {
    id: "item_9",
    title: "MDN Web Docs",
    contentType: "url" as const,
    itemTypeId: "type_link",
    content: null,
    url: "https://developer.mozilla.org",
    language: null,
    tags: ["docs", "web", "reference"],
    isFavorite: false,
    isPinned: false,
    lastUsedAt: "2026-05-24T09:00:00Z",
    createdAt: "2026-02-15T11:00:00Z",
    collectionIds: ["col_5"],
  },
  {
    id: "item_10",
    title: "Explain This Code",
    contentType: "text" as const,
    itemTypeId: "type_prompt",
    content: `Explain the following code step by step. Assume the reader is a mid-level developer. Cover what it does, why each part exists, and any potential gotchas.`,
    language: null,
    tags: ["explain", "ai", "learning"],
    isFavorite: false,
    isPinned: false,
    lastUsedAt: "2026-05-23T14:00:00Z",
    createdAt: "2026-05-10T10:00:00Z",
    collectionIds: ["col_2"],
  },
];
