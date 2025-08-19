import React, { useEffect, useRef, useState } from "react";

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Tetris фигуры
const shapes = [
  { shape: [[1,1,1,1]], color: "cyan" }, // I
  { shape: [[1,1],[1,1]], color: "yellow" }, // O
  { shape: [[0,1,0],[1,1,1]], color: "purple" }, // T
  { shape: [[1,1,0],[0,1,1]], color: "green" }, // S
  { shape: [[0,1,1],[1,1,0]], color: "red" } // Z
];

export default function Tetris() {
  const canvasRef = useRef();
  const [grid, setGrid] = useState(
    Array.from({ length: ROWS }, () => Array(COLS).fill(0))
  );
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [current, setCurrent] = useState(getRandomPiece());
  const [nextPiece, setNextPiece] = useState(getRandomPiece());
  const [gameOver, setGameOver] = useState(false);

  function getRandomPiece() {
    return {...shapes[Math.floor(Math.random() * shapes.length)], x: 3, y: 0};
  }

  const drawBlock = (ctx, x, y, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = "black";
    ctx.strokeRect(x*BLOCK_SIZE, y*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  };

  const drawGrid = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0,0, canvasRef.current.width, canvasRef.current.height);
    grid.forEach((row, y) => row.forEach((cell, x) => {
      if(cell) drawBlock(ctx, x, y, cell);
    }));
    current.shape.forEach((row, dy) => row.forEach((cell, dx) => {
      if(cell) drawBlock(ctx, current.x+dx, current.y+dy, current.color);
    }));
  };

  const collides = (piece, xOffset=0, yOffset=0) => {
    return piece.shape.some((row, y) =>
      row.some((cell, x) => {
        if(!cell) return false;
        const newX = piece.x + x + xOffset;
        const newY = piece.y + y + yOffset;
        return newX < 0 || newX >= COLS || newY >= ROWS || (grid[newY] && grid[newY][newX]);
      })
    );
  };

  const merge = (piece) => {
    const newGrid = grid.map(row => [...row]);
    piece.shape.forEach((row, y) => row.forEach((cell, x) => {
      if(cell) newGrid[piece.y + y][piece.x + x] = piece.color;
    }));
    setGrid(newGrid);
  };

  const clearLines = () => {
    let cleared = 0;
    let newGrid = grid.filter(row => row.some(cell => !cell));
    cleared = ROWS - newGrid.length;
    while(newGrid.length < ROWS) newGrid.unshift(Array(COLS).fill(0));
    if(cleared) {
      setScore(prev => prev + cleared*100);
      if((score+cleared*100) % 500 === 0) setLevel(prev => prev+1);
    }
    setGrid(newGrid);
  };

  const move = dx => {
    if(!collides(current, dx, 0)) setCurrent(prev => ({...prev, x: prev.x + dx}));
  };

  const drop = () => {
    if(!collides(current, 0, 1)) {
      setCurrent(prev => ({...prev, y: prev.y + 1}));
    } else {
      merge(current);
      clearLines();
      const next = nextPiece;
      setCurrent({...next, x: 3, y: 0});
      setNextPiece(getRandomPiece());
      if(collides({...next, x:3, y:0})) setGameOver(true);
    }
  };

  const rotate = () => {
    const newShape = current.shape[0].length === 1 ? current.shape :
      current.shape[0].map((_, i) => current.shape.map(row => row[i])).reverse();
    if(!collides({...current, shape: newShape})) setCurrent(prev => ({...prev, shape: newShape}));
  };

  useEffect(() => {
    if(gameOver) return;
    const interval = setInterval(() => drop(), Math.max(100, 500 - (level-1)*50));
    return () => clearInterval(interval);
  }, [current, level, gameOver]);

  useEffect(() => drawGrid(), [grid, current]);

  useEffect(() => {
    const handleKey = e => {
      if(gameOver) return;
      if(e.key === "ArrowLeft") move(-1);
      if(e.key === "ArrowRight") move(1);
      if(e.key === "ArrowDown") drop();
      if(e.key === "ArrowUp") rotate();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, gameOver]);

  // Свайпы для мобильного
  useEffect(() => {
    let startX=0, startY=0;
    const handleTouchStart = e => {
      const t = e.touches[0]; startX=t.clientX; startY=t.clientY;
    };
    const handleTouchEnd = e => {
      if(gameOver) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if(Math.abs(dx) > Math.abs(dy)){
        if(dx>20) move(1); else if(dx<-20) move(-1);
      } else {
        if(dy>20) drop(); else if(dy<-20) rotate();
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [current, gameOver]);

  return (
    <div>
      <p>Lv.{level} {score} {gameOver ? "GAME OVER" : "Pause Next"}</p>
      <canvas ref={canvasRef} width={COLS*BLOCK_SIZE} height={ROWS*BLOCK_SIZE} style={{border:"2px solid #000"}}/>
      {gameOver && <button onClick={() => {
        setGrid(Array.from({length:ROWS},()=>Array(COLS).fill(0)));
        setScore(0); setLevel(1);
        setCurrent(getRandomPiece()); setNextPiece(getRandomPiece());
        setGameOver(false);
      }}>Restart</button>}
    </div>
  );
}
