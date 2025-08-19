import React, { useEffect, useRef, useState } from "react";

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const shapes = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]]  // Z
];

export default function Tetris() {
  const canvasRef = useRef();
  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [score, setScore] = useState(0);

  const drawBlock = (ctx, x, y, color = "red") => {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    grid.forEach((row, y) =>
      row.forEach((cell, x) => cell && drawBlock(ctx, x, y))
    );
  }, [grid]);

  // Простая логика: блок падает вниз
  useEffect(() => {
    const interval = setInterval(() => {
      setGrid(prev => {
        const newGrid = [...prev];
        for (let y = ROWS - 2; y >= 0; y--) {
          for (let x = 0; x < COLS; x++) {
            newGrid[y + 1][x] = newGrid[y][x];
            newGrid[y][x] = 0;
          }
        }
        // случайный блок сверху
        newGrid[0][Math.floor(Math.random() * COLS)] = 1;
        return newGrid;
      });
      setScore(prev => prev + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <p>Lv.1 {score} Pause Next</p>
      <canvas
        ref={canvasRef}
        width={COLS * BLOCK_SIZE}
        height={ROWS * BLOCK_SIZE}
        style={{ border: "2px solid #000" }}
      />
    </div>
  );
}
