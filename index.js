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
            io.emit("actualizar-enemigos", jugadores);
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
            console.log(`Jugador ${jugadorId} envió ataques:`, ataques);
        }
    });

    // Evento: Obtener ataques del enemigo
    socket.on("obtener-ataques", (enemigoId) => {
        const enemigo = jugadores.find((jugador) => enemigoId === jugador.id);
        if (enemigo && enemigo.ataques && enemigo.ataques.length > 0) {
            console.log(`Enviando ataques de ${enemigoId}:`, enemigo.ataques);
            socket.emit("ataques-enemigo", enemigo.ataques);
        }
    });

    // Evento: Desconexión
    socket.on("disconnect", () => {
        const index = jugadores.findIndex((j) => j.socketId === socket.id);
        if (index >= 0) {
            console.log("Jugador desconectado:", jugadores[index].id);
            jugadores.splice(index, 1);
            io.emit("actualizar-enemigos", jugadores);
        }
    });
});

httpServer.listen(8080, "0.0.0.0", () =>{
    console.log('🚀 Server running on port 8080')
    console.log('📱 Accede desde otros dispositivos en tu red local usando:')
    console.log('   http://<TU_IP_LOCAL>:8080')
})