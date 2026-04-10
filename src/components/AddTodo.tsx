

import React, { useState } from "react";
import styles from "./AddTodo.module.css";

interface AddTodoProps {
  isDark: boolean;
  onAdd: (text: string, dueDate: string) => void;
}

export default function AddTodo({ isDark, onAdd }: AddTodoProps) {
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Default due date to tomorrow
  function getDefaultDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const finalDate = dueDate || getDefaultDate();
    onAdd(text, finalDate);
    setText("");
    setDueDate("");
    setShowDatePicker(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className={`${styles.addTodo} ${isDark ? styles.dark : styles.light}`}>
      {/* Fake circle that opens date picker */}
      <button
        type="button"
        className={`${styles.circle} ${showDatePicker ? styles.active : ""}`}
        onClick={() => setShowDatePicker((prev) => !prev)}
        aria-label="Set due date"
        title="Click to set due date before adding"
      />

      <div className={styles.inputWrapper}>
        <input
          type="text"
          placeholder="Create a new todo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className={styles.textInput}
        />

        {showDatePicker && (
          <div className={`${styles.datePickerPopup} ${isDark ? styles.darkPopup : styles.lightPopup}`}>
            <label className={styles.dateLabel}>Due date:</label>
            <input
              type="date"
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
              className={`${styles.dateInput} ${isDark ? styles.darkDate : styles.lightDate}`}
            />
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={() => setShowDatePicker(false)}
            >
              Set
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={handleSubmit}
        aria-label="Add todo"
        disabled={!text.trim()}
      >
        +
      </button>
    </div>
  );
}
