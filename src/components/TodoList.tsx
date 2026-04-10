

import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Todo, FilterType } from "@/types/todo";
import TodoItem from "./TodoItem";
import styles from "./TodoList.module.css";

interface TodoListProps {
  todos: Todo[];
  allTodos: Todo[];
  filter: FilterType;
  isDark: boolean;
  activeCount: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onFilterChange: (f: FilterType) => void;
  onClearCompleted: () => void;
  onReorder: (newOrder: Todo[]) => void;
}

export default function TodoList({
  todos,
  allTodos,
  filter,
  isDark,
  activeCount,
  onToggle,
  onDelete,
  onFilterChange,
  onClearCompleted,
  onReorder,
}: TodoListProps) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    // We need to reorder within the filtered view but update the full list
    // This is a bit tricky - we reorder the filtered items and then
    // reconstruct the full list preserving items not in the current filter
    const filtered = [...todos];
    const [moved] = filtered.splice(result.source.index, 1);
    filtered.splice(result.destination.index, 0, moved);

    // Now merge back into allTodos
    // Replace the filtered items in their original positions
    const newAllTodos = [...allTodos];
    const filteredIds = new Set(todos.map((t) => t.id));

    // Remove all filtered items from allTodos order
    const nonFiltered = newAllTodos.filter((t) => !filteredIds.has(t.id));

    // We need to interleave them back... 
    // Actually simpler: just use the filtered list as the new full order if filter is "all"
    // For other filters, we rebuild by replacing positions
    if (filter === "all") {
      onReorder(filtered);
    } else {
      // Find indices of filtered items in allTodos
      const indices: number[] = [];
      allTodos.forEach((t, i) => {
        if (filteredIds.has(t.id)) indices.push(i);
      });

      const newOrder = [...allTodos];
      filtered.forEach((todo, i) => {
        newOrder[indices[i]] = todo;
      });
      onReorder(newOrder);
    }
  }

  const filters: FilterType[] = ["all", "active", "completed"];

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : styles.light}`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todo-list">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={styles.list}
            >
              {todos.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No tasks here!</p>
                </div>
              ) : (
                todos.map((todo, index) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    index={index}
                    isDark={isDark}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.itemsLeft}>{activeCount} items left</span>

        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.activeFilter : ""}`}
              onClick={() => onFilterChange(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          className={styles.clearBtn}
          onClick={onClearCompleted}
        >
          Clear Completed
        </button>
      </div>
    </div>
  );
}
