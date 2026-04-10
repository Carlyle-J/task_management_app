

import React, { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Todo } from "@/types/todo";
import { differenceInCalendarDays, parseISO, format } from "date-fns";
import styles from "./TodoItem.module.css";

interface TodoItemProps {
  todo: Todo;
  index: number;
  isDark: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({
  todo,
  index,
  isDark,
  onToggle,
  onDelete,
}: TodoItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseISO(todo.dueDate);
  const daysLeft = differenceInCalendarDays(due, today);

  function getDueBadgeText() {
    if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
    if (daysLeft === 0) return "Due today";
    if (daysLeft === 1) return "Due tomorrow";
    return `${daysLeft}d left`;
  }

  function getDueBadgeColor() {
    if (todo.completed) return isDark ? "#555" : "#bbb";
    if (daysLeft < 0) return "#e74c3c";
    if (daysLeft === 0) return "#e67e22";
    if (daysLeft <= 2) return "#f1c40f";
    return isDark ? "#a9b4d4" : "#7b8cc9";
  }

  const formattedDate = format(due, "MMM d, yyyy");

  return (
    <Draggable draggableId={todo.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${styles.todoItem} ${isDark ? styles.dark : styles.light} ${
            snapshot.isDragging ? styles.dragging : ""
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Checkbox */}
          <button
            className={`${styles.checkbox} ${todo.completed ? styles.checked : ""}`}
            onClick={() => onToggle(todo.id)}
            aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {todo.completed && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="9"
                viewBox="0 0 11 9"
              >
                <path
                  fill="none"
                  stroke="#FFF"
                  strokeWidth="2"
                  d="M1 4.304L3.696 7l6.304-6"
                />
              </svg>
            )}
          </button>

          {/* Todo text and due date */}
          <div className={styles.todoContent}>
            <span
              className={`${styles.todoText} ${todo.completed ? styles.completedText : ""}`}
            >
              {todo.text}
            </span>
            <div className={styles.dueDateRow}>
              <span className={styles.dueDateLabel} style={{ color: getDueBadgeColor() }}>
                📅 {formattedDate}
              </span>
              <span
                className={styles.daysLeftBadge}
                style={{
                  backgroundColor: getDueBadgeColor() + "22",
                  color: getDueBadgeColor(),
                  borderColor: getDueBadgeColor() + "55",
                }}
              >
                {getDueBadgeText()}
              </span>
            </div>
          </div>

          {/* Delete button - shows on hover */}
          <button
            className={`${styles.deleteBtn} ${isHovered ? styles.visible : ""}`}
            onClick={() => onDelete(todo.id)}
            aria-label="Delete todo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
            >
              <path
                fill={isDark ? "#494C6B" : "#9495A5"}
                fillRule="evenodd"
                d="M16.97 0l.708.707L9.546 8.84l8.132 8.132-.707.707-8.132-8.132-8.132 8.132L0 16.97l8.132-8.132L0 .707.707 0 8.84 8.132 16.971 0z"
              />
            </svg>
          </button>
        </div>
      )}
    </Draggable>
  );
}
