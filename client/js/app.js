import { initWebApp } from './telegram/tg-webapp.js';
import { createEngine } from './game/engine.js';
import { createRenderer } from './game/render.js';
import { setupInput } from './game/input.js';
import { showTouchControls } from './ui/buttons.js';
import { LeaderboardUI } from './leaderboard/ui.js';
import { apiClient } from './leaderboard/api-client.js';
import { SubscriptionGate } from './telegram/subscription-gate.js';


(async function main(){
const tg = initWebApp(); // Telegram.WebApp + theme, haptic, expand()


// Gate: только подписчики
const gate = new SubscriptionGate(tg);
const allowed = await gate.check();
if (!allowed) { gate.render(); return; }


const board = document.getElementById('board');
const next = document.getElementById('next');
const renderer = createRenderer(board, next);
const engine = createEngine(renderer);


const lbRoot = document.getElementById('leaderboard');
const lb = new LeaderboardUI(lbRoot, apiClient);
lb.renderSkeleton();
lb.refreshTop();


setupInput(engine);
showTouchControls(document.getElementById('touch-controls'), engine);


// Пауза
document.getElementById('btn-pause').addEventListener('click', () => engine.togglePause());


// Сохранение очков по окончании игры
engine.on('gameover', async ({ score }) => {
try {
const user = tg.initDataUnsafe?.user; // {id, username, first_name, ...}
await apiClient.submitScore({ score, user });
lb.refreshTop();
tg.HapticFeedback?.notificationOccurred('success');
} catch (e) {
console.error(e);
}
});


engine.start();
})();
