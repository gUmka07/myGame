export function createTetrisCore(cols=10, rows=20){
const grid = Array.from({length: rows}, () => Array(cols).fill(0));
const shapes = [
[[1,1,1,1]], // I
[[1,1,1],[0,1,0]], // T
[[1,1,0],[0,1,1]], // S
[[0,1,1],[1,1,0]], // Z
[[1,1],[1,1]], // O
[[1,0,0],[1,1,1]], // J
[[0,0,1],[1,1,1]] // L
];
const colors = ['red','blue','yellow','green','red','blue','yellow'];


let cur = newPiece();


function newPiece(){
const i = Math.floor(Math.random()*shapes.length);
return { m: shapes[i], x: 3, y: 0, color: colors[i] };
}


function rotate(m){
return m[0].map((_, i)=> m.map(r=>r[i]).reverse());
}


function collide(mat, p){
return p.m.some((row, y)=> row.some((v, x)=> v && (
mat[p.y + y]?.[p.x + x] !== 0 ||
p.y + y >= rows || p.x + x < 0 || p.x + x >= cols
)));
}


function merge(){
cur.m.forEach((row, y)=> row.forEach((v, x)=> { if(v){ grid[cur.y+y][cur.x+x] = cur.color; }}));
}


function clearLines(){
let cleared = 0;
for(let y=rows-1; y>=0; y--){
if(grid[y].every(v=>v!==0)){ grid.splice(y,1); grid.unshift(Array(cols).fill(0)); cleared++; y++; }
}
return cleared;
}


return {
grid, get piece(){ return cur; },
step(){
const next = { ...cur, y: cur.y + 1 };
if(collide(grid, next)){
merge();
const lines = clearLines();
cur = newPiece();
const gameover = collide(grid, cur);
return { locked: true, lines, gameover };
} else { cur = next; return { locked: false, lines: 0, gameover: false }; }
},
move(dx){ const p = { ...cur, x: cur.x + dx }; if(!collide(grid,p)) cur=p; },
drop(){ let locked=false; while(!locked){ const r=this.step(); locked=r.locked; if(r.gameover) return r; } return { locked:true, lines:0, gameover:false }; },
rotate(){ const p={...cur, m: rotate(cur.m)}; if(!collide(grid,p)) cur=p; },
};
}
