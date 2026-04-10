import { useState, useEffect } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setIsDark(saved === "dark");
    } else {
      // default to dark mode like the design
      setIsDark(true);
    }
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const newVal = !prev;
      localStorage.setItem("theme", newVal ? "dark" : "light");
      return newVal;
    });
  }

  return { isDark, toggleTheme };
}
