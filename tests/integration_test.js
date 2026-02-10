const io = require('socket.io-client');

const SERVER = 'http://localhost:8080';

function makeClient(name, simulateMovement = false) {
  const socket = io(SERVER);
  const state = { 
    id: null, 
    socket,
    name,
    x: Math.random() * 300 + 50,
    y: Math.random() * 200 + 50,
    mokepon: null,
    enemies: []
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
    console.log(`[${name}] 👾 Enemy list updated:`, 
      enemigos.map(e => `${e.id.substring(0,8)}... (x:${e.x},y:${e.y})`).join(', ') || 'none');
  });

  socket.on('ataques-enemigo', (ataques) => {
    console.log(`[${name}] ⚔️  Battle started! Received attacks:`, ataques);
  });

  // Seleccionar mokepon después de 500ms
  setTimeout(() => {
    const mokepon = name === 'Client1' ? 'Hipodoge' : 'Ratigueya';
    state.mokepon = mokepon;
    socket.emit('seleccionar-mokepon', { jugadorId: state.id, mokepon });
    console.log(`[${name}] 🔥 Selected mokepon: ${mokepon}`);
  }, 500);

  // Simular movimiento si es solicitado
  if (simulateMovement) {
    let moveCount = 0;
    const moveInterval = setInterval(() => {
      if (moveCount >= 3) {
        clearInterval(moveInterval);
        return;
      }
      // Mover hacia otras ubicaciones
      state.x += 30;
      state.y += 20;
      socket.emit('enviar-posicion', { jugadorId: state.id, x: state.x, y: state.y });
      console.log(`[${name}] 🚶 Moved to (${state.x}, ${state.y})`);
      moveCount++;
    }, 800);
  }

  return state;
}

async function run() {
  console.log('\n🎮 ========== CRACKPON MULTIPLAYER TEST ==========');
  console.log('📍 Server:', SERVER);
  
  // Crear dos clientes
  const c1 = makeClient('Client1', true);
  const c2 = makeClient('Client2', true);

  // Esperar a que todo se inicialice
  await new Promise(r => setTimeout(r, 5000));

  // Verificaciones finales
  console.log('\n📊 ========== FINAL STATE ==========');
  console.log(`[Client1] ID: ${c1.id?.substring(0, 8)}..., Mokepon: ${c1.mokepon}, Position: (${c1.x}, ${c1.y})`);
  console.log(`[Client1] Enemies received: ${c1.enemies.length}`);
  
  console.log(`\n[Client2] ID: ${c2.id?.substring(0, 8)}..., Mokepon: ${c2.mokepon}, Position: (${c2.x}, ${c2.y})`);
  console.log(`[Client2] Enemies received: ${c2.enemies.length}`);

  // Validaciones
  const self1InEnemies = c1.enemies.some(e => e.id === c1.id);
  const self2InEnemies = c2.enemies.some(e => e.id === c2.id);
  
  console.log('\n✅ ========== VALIDATION ==========');
  console.log(`❌ Client1 sees self as enemy? ${self1InEnemies ? 'YES (BUG!)' : 'NO (Good!)'}`);
  console.log(`❌ Client2 sees self as enemy? ${self2InEnemies ? 'YES (BUG!)' : 'NO (Good!)'}`);
  console.log(`✓ Client1 sees Client2? ${c1.enemies.length > 0 ? 'YES' : 'NO'}`);
  console.log(`✓ Client2 sees Client1? ${c2.enemies.length > 0 ? 'YES' : 'NO'}`);

  // Cerrar
  c1.socket.close();
  c2.socket.close();
  console.log('\n🎬 Test complete. Sockets closed.\n');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Test error:', err);
  process.exit(1);
});
