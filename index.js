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

    // Evento: Unirse al juego
    socket.on("unirse", () => {
        const id = `${Math.random()}`;
        const jugador = new Jugador(id, socket.id);
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
            // Enviar solo los enemigos (no incluir al jugador actual)
            const enemigos = jugadores.filter((jugador) => jugadorId !== jugador.id);
            io.emit("actualizar-enemigos", enemigos);
        }
    });

    // Evento: Actualizar posición
    socket.on("enviar-posicion", (data) => {
        const { jugadorId, x, y } = data;
        
        const jugadorIndex = jugadores.findIndex((jugador) => jugadorId === jugador.id);
        if (jugadorIndex >= 0) {
            jugadores[jugadorIndex].actualizarPosicion(x, y);
            
            const enemigos = jugadores.filter((jugador) => jugadorId !== jugador.id);
            io.emit("actualizar-enemigos", enemigos);
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