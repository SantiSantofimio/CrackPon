const io = require('socket.io-client');

const SERVER = 'http://localhost:8080';

function makeClient(name){
  const socket = io(SERVER);
  const state = { id: null, socket };

  socket.on('connect', ()=> console.log(`[${name}] connected via socket id ${socket.id}`));
  socket.on('id-asignado', (id)=>{
    state.id = id;
    console.log(`[${name}] id-asignado -> ${id}`);
  });

  // Emitir 'unirse' para obtener id-asignado
  socket.on('connect', ()=>{
    socket.emit('unirse');
  });

  socket.on('actualizar-enemigos', (enemigos)=>{
    console.log(`[${name}] actualizar-enemigos ->`, JSON.stringify(enemigos));
  });

  return state;
}

async function run(){
  const c1 = makeClient('Client1');
  const c2 = makeClient('Client2');

  // Esperar ids asignados
  await new Promise(r=>setTimeout(r, 800));

  // Seleccionar mokepon para ambos
  c1.socket.emit('seleccionar-mokepon', { jugadorId: c1.id, mokepon: 'Hipodoge' });
  c2.socket.emit('seleccionar-mokepon', { jugadorId: c2.id, mokepon: 'Ratigueya' });

  // Esperar respuesta y posiciones
  await new Promise(r=>setTimeout(r, 800));

  // Enviar posiciones
  c1.socket.emit('enviar-posicion', { jugadorId: c1.id, x: 60, y: 80 });
  c2.socket.emit('enviar-posicion', { jugadorId: c2.id, x: 300, y: 200 });

  // Esperar actualizaciones
  await new Promise(r=>setTimeout(r, 1000));

  // Cerrar
  c1.socket.close();
  c2.socket.close();
  process.exit(0);
}

run();
