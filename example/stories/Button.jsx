import React, { useState } from "react";

/**
 * Primary UI component for user interaction
 */
export const Button = () => {
  const [clicks, setClicks] = useState(0);
  const increment = () => {
    setClicks((click) => click + 1);
  };
  return (
    <button onClick={increment} type="button">
      Click(s): {clicks}
    </button>
  );
};
