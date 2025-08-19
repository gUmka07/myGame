import { createTetrisCore } from './tetris-core.js';
import { EventEmitter } from './mini-emitter.js';

export function createEngine(renderer){
  const ee = new EventEmitter();
  const core = createTetrisCore();
  let score = 0, level = 1, delay = 800, paused = false, raf, lastDrop = 0;

  function update(ts){
    if(paused){
      raf = requestAnimationFrame(update);
      return;
    }
    if(ts - lastDrop > delay){
      const { lines, gameover } = core.step();
      if(lines){
        score += [0,100,300,700,1500][lines];
        level = 1 + Math.floor(score/2000);
        delay = Math.max(120, 800 - level*40);
      }
      renderer.draw(core.grid, core.piece, { score, level });
      if(gameover){
        cancelAnimationFrame(raf);
        console.log("Game over");
        return;
      }
      lastDrop = ts;
    }
    raf = requestAnimationFrame(update);
  }

  raf = requestAnimationFrame(update);
  return { ee, core };
}
