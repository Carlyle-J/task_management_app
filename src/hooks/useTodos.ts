

import { useState, useEffect } from "react";
import { Todo, FilterType } from "@/types/todo";

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    setIsLoading(true);
    try {
      // No need to send username causenthe server reads it from the JWT cookie
      const response = await fetch("/api/todos", {
        credentials: "include", // This sends the cookie automatically
      });

      if (response.status === 401) {
        // Not logged in, just show empty list
        setTodos([]);
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setTodos(data.todos);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function addTodo(text: string, dueDate: string) {
    if (!text.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, dueDate }),
      });

      const data = await response.json();
      if (response.ok) {
        setTodos((prev) => [data.todo, ...prev]);
      } else {
        console.error("Failed to add todo:", data.error);
      }
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  }

  async function toggleTodo(id: string) {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newCompleted = !todo.completed;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
    );

    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: newCompleted }),
      });

      if (!response.ok) {
        // Revert on failure
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: todo.completed } : t))
        );
      }
    } catch (error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: todo.completed } : t))
      );
    }
  }

  async function deleteTodo(id: string) {
    const previousTodos = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setTodos(previousTodos);
      }
    } catch (error) {
      setTodos(previousTodos);
    }
  }

  async function clearCompleted() {
    const previousTodos = todos;
    setTodos((prev) => prev.filter((t) => !t.completed));

    try {
      const response = await fetch("/api/todos?clearCompleted=true", {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        setTodos(previousTodos);
      }
    } catch (error) {
      setTodos(previousTodos);
    }
  }

  function reorderTodos(newOrder: Todo[]) {
    setTodos(newOrder);
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    reorderTodos,
    activeCount,
    isLoading,
    refetch: fetchTodos,
  };
}
