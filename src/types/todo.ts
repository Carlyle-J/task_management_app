

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  dueDate: string; 
  createdAt: string;
}

export type FilterType = "all" | "active" | "completed";
