const io = require('socket.io-client');

const SERVER = 'http://localhost:8080';

function makeClient(name, x, y, simulateMovement = false) {
  const socket = io(SERVER);
  const state = { 
    id: null, 
    socket,
    name,
    x,
    y,
    mokepon: null,
    enemies: [],
    ataques: [],
    ataquesSent: false,
  };

  socket.on('connect', () => {
    console.log(`\n[${name}] ✅ Connected (socket: ${socket.id})`);
    socket.emit('unirse');
  });

  socket.on('id-asignado', (id) => {
    state.id = id;
    console.log(`[${name}] 🎮 ID assigned: ${id}`);
  });

  socket.on('actualizar-enemigos', (enemigos) => {
    state.enemies = enemigos;
    if (state.enemies.length > 0) {
      const enemy = state.enemies[0];
      const dist = Math.sqrt((enemy.x - state.x) ** 2 + (enemy.y - state.y) ** 2);
      console.log(`[${name}] 👾 Enemy at (${enemy.x},${enemy.y}), distance: ${dist.toFixed(1)}px`);
    }
  });

  socket.on('ataques-enemigo', (ataques) => {
    console.log(`[${name}] ⚔️🔥 BATTLE TRIGGERED! Attacks received:`, ataques);
  });

  // Seleccionar mokepon después de 500ms
  setTimeout(() => {
    const mokepon = name === 'Client1' ? 'Hipodoge' : 'Ratigueya';
    state.mokepon = mokepon;
    socket.emit('seleccionar-mokepon', { jugadorId: state.id, mokepon });
    console.log(`[${name}] 🔥 Selected mokepon: ${mokepon}`);
  }, 500);

  // Simular movimiento acercándose al enemigo
  if (simulateMovement) {
    let moveCount = 0;
    const moveInterval = setInterval(() => {
      if (moveCount >= 5) {
        clearInterval(moveInterval);
        return;
      }
      // Mover directamente hacia el enemigo si lo ve
      if (state.enemies.length > 0) {
        const enemy = state.enemies[0];
        const dx = enemy.x - state.x;
        const dy = enemy.y - state.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 30) {
          // Mover 15px hacia el enemigo
          state.x += (dx / dist) * 15;
          state.y += (dy / dist) * 15;
          console.log(`[${name}] 🚶 Moving to (${state.x.toFixed(0)}, ${state.y.toFixed(0)}), dist to enemy: ${dist.toFixed(1)}px`);
        } else {
          console.log(`[${name}] ⚠️  COLLISION DETECTED! Distance: ${dist.toFixed(1)}px`);
          clearInterval(moveInterval);
          return;
        }
      }
      socket.emit('enviar-posicion', { jugadorId: state.id, x: state.x, y: state.y });
      moveCount++;
    }, 600);
  }

  return state;
}

async function run() {
  console.log('\n🎮 ========== CRACKPON COLLISION TEST ==========');
  console.log('📍 Server:', SERVER);
  
  // Crear dos clientes con posiciones iniciales específicas
  // Client1: (100, 100)
  // Client2: (250, 250)
  // Distancia inicial: sqrt((250-100)^2 + (250-100)^2) = sqrt(45000) ≈ 212px
  const c1 = makeClient('Client1', 100, 100, true);
  const c2 = makeClient('Client2', 250, 250, false);

  // Esperar a que todo se inicialice y collision ocurra
  await new Promise(r => setTimeout(r, 8000));

  // Verificaciones finales
  console.log('\n📊 ========== FINAL STATE ==========');
  console.log(`[Client1] Position: (${c1.x.toFixed(0)}, ${c1.y.toFixed(0)})`, `Mokepon: ${c1.mokepon}`);
  console.log(`[Client2] Position: (${c2.x.toFixed(0)}, ${c2.y.toFixed(0)})`, `Mokepon: ${c2.mokepon}`);

  if (c1.enemies.length > 0 && c2.enemies.length > 0) {
    const dist = Math.sqrt((c1.enemies[0].x - c1.x) ** 2 + (c1.enemies[0].y - c1.y) ** 2);
    console.log(`\n📏 Final distance between players: ${dist.toFixed(1)}px`);
    console.log(`✓ Both clients see each other: YES`);
  }

  // Cerrar
  c1.socket.close();
  c2.socket.close();
  console.log('\n🎬 Test complete.\n');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
