const express = require("express");
const cors = require("cors")
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

const jugadores = [];
const batallas = {}; // Rastrear batallas activas

// Dimensiones por defecto del mapa en servidor (aprox. cliente)
const MAP_WIDTH = 400;
const MAP_HEIGHT = 300;

const MIN_DISTANCE_BETWEEN_PLAYERS = 120;

class Jugador {
    constructor(id, socketId) {
        this.id = id;
        this.socketId = socketId;
    }

    asignarMokepon(mokepon) {
        this.mokepon = mokepon
    }

    actualizarPosicion(x, y) {
        this.x = x
        this.y = y
    }

    asignarAtaques(ataques) {
        this.ataques = ataques
    }
}

class Mokepon {
    constructor(nombre) {
        this.nombre = nombre
    }
}

// Socket.IO eventos
io.on("connection", (socket) => {
    console.log("Nuevo jugador conectado:", socket.id);

    // Helper: generar posición aleatoria no colisionante
    function generarPosicionLibre(existingPlayers) {
        const maxAttempts = 20;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = Math.floor(Math.random() * (MAP_WIDTH - 100)) + 50;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - 100)) + 50;
            // Verificar distancia mínima con jugadores existentes
            let ok = true;
            for (const p of existingPlayers) {
                if (p.x !== undefined && p.y !== undefined) {
                    const dx = p.x - x;
                    const dy = p.y - y;
                    const dist2 = dx * dx + dy * dy;
                    if (dist2 < MIN_DISTANCE_BETWEEN_PLAYERS * MIN_DISTANCE_BETWEEN_PLAYERS) {
                        ok = false;
                        break;
                    }
                }
            }
            if (ok) return { x, y };
        }
        // Fallback: posición por defecto
        return { x: 50, y: 50 };
    }

    // Evento: Unirse al juego
    socket.on("unirse", () => {
        const id = `${Math.random()}`;
        const jugador = new Jugador(id, socket.id);
        // Asignar posición inicial evitando colisiones con otros jugadores
        const posicion = generarPosicionLibre(jugadores);
        jugador.x = posicion.x;
        jugador.y = posicion.y;
        jugadores.push(jugador);
        
        socket.emit("id-asignado", id);
        console.log("Jugador agregado:", id);
    });

    // Evento: Seleccionar Mokepon
    socket.on("seleccionar-mokepon", (data) => {
        const { jugadorId, mokepon } = data;
        const mokeponObj = new Mokepon(mokepon);
        
        const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id);
        if (jugadorIndex >= 0) {
            jugadores[jugadorIndex].asignarMokepon(mokeponObj);
            // Enviar a cada jugador su lista de enemigos (filtrada por destinatario)
            jugadores.forEach((j) => {
                const enemigosParaEste = jugadores.filter((otro) => otro.id !== j.id);
                io.to(j.socketId).emit("actualizar-enemigos", enemigosParaEste);
            });
        }
    });

    // Evento: Actualizar posición
    socket.on("enviar-posicion", (data) => {
        const { jugadorId, x, y } = data;
        
        const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id);
        if (jugadorIndex >= 0) {
            jugadores[jugadorIndex].actualizarPosicion(x, y);
            
            // Emitir a cada jugador su lista de enemigos actualizada
            jugadores.forEach((j) => {
                const enemigosParaEste = jugadores.filter((otro) => otro.id !== j.id);
                io.to(j.socketId).emit("actualizar-enemigos", enemigosParaEste);
            });
        }
    });

    // Evento: Enviar ataques
    socket.on("enviar-ataques", (data) => {
        const { jugadorId, ataques } = data;
        
        const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id);
        if (jugadorIndex >= 0) {
            jugadores[jugadorIndex].asignarAtaques(ataques);
            console.log(`Jugador ${jugadorId} envió ataques`);
            
            // Buscar otros jugadores
            const otrosJugadores = jugadores.filter((j) => j.id !== jugadorId);
            
            // Si hay otro jugador y ya envió ataques, iniciar combate
            otrosJugadores.forEach((otro) => {
                if (otro.ataques && otro.ataques.length === 5) {
                    console.log(`COMBATE: ${jugadorId} vs ${otro.id}`);
                    
                    // Enviar ataques del otro al jugador actual
                    io.to(jugadores[jugadorIndex].socketId).emit("ataques-enemigo", otro.ataques);
                    
                    // Enviar ataques del jugador actual al otro
                    io.to(otro.socketId).emit("ataques-enemigo", ataques);
                    
                    // Resetear ataques despues de emitir para permitir nuevo combate
                    jugadores[jugadorIndex].ataques = [];
                    otro.ataques = [];
                    console.log("Ataques reiniciados para permitir nuevo combate");
                }
            });
        }
    });

    // Evento: Desconexión
    socket.on("disconnect", () => {
        const index = jugadores.findIndex((j) => j.socketId === socket.id);
        if (index >= 0) {
            const idJugadorDesconectado = jugadores[index].id;
            console.log("Jugador desconectado:", idJugadorDesconectado);
            jugadores.splice(index, 1);
            
            // Notificar a los demás jugadores
            const enemigos = jugadores.filter((j) => j.id !== idJugadorDesconectado);
            io.emit("actualizar-enemigos", enemigos);
        }
    });
});

httpServer.listen(8080, "0.0.0.0", () =>{
    console.log('🚀 Server running on port 8080')
    console.log('📱 Accede desde otros dispositivos en tu red local usando:')
    console.log('   http://<TU_IP_LOCAL>:8080')
})