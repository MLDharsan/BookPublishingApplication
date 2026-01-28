export type Book = {
  id: string;
  title: string;
  authorName: string;
  priceLKR: number;
  coverUrl?: string;
  description: string;
  tags: string[];
  allowDownload: boolean;
  createdAt: string; // ISO date string
};

export const books: Book[] = [
  {
    id: "1",
    title: "Jaffna Stories",
    authorName: "Loga Dharsan",
    priceLKR: 1200,
    description: "Short stories inspired by Jaffna culture and travel.",
    tags: ["Culture", "Travel"],
    allowDownload: true,
    createdAt: "2026-01-10",
  },
  {
    id: "2",
    title: "Beginner Cybersecurity",
    authorName: "A. Author",
    priceLKR: 1500,
    description: "A starter guide to cyber attacks and defense.",
    tags: ["Security", "Education"],
    allowDownload: false,
    createdAt: "2026-01-18",
  },
  {
    id: "3",
    title: "Algorithms Made Simple",
    authorName: "K. Writer",
    priceLKR: 1800,
    description: "Understand sorting, searching, and graphs with examples.",
    tags: ["Education", "Computer Science"],
    allowDownload: true,
    createdAt: "2026-01-22",
  },
];
