const btnRplay = document.getElementById('replay');
const sectionSelectAttack = document.getElementById('select-attack');
const botonMascotaJugador = document.getElementById('btn-select-pet');
const botonReiniciar = document.getElementById('reiniciar');

const sectionSelectPet = document.getElementById('select-pet');
const petPlayer = document.getElementById('pet-player');

const petEnemi = document.getElementById('pet-enemi');

const spanVidasPlayer = document.getElementById('vida-player');
const spanVidasEnemi = document.getElementById('vida-enemi');

const sectionMensaje = document.getElementById('resultado');
const resultadoPlayer = document.getElementById('resultado-player');

const resultadoEnemi = document.getElementById('resultado-enemi');
const contenedorTarjetas = document.getElementById('contenedor-tarjeta');
const contenedorAtaques = document.getElementById('contenedor-ataques');

const sectionMapa = document.getElementById('ver-mapa');
const mapa = document.getElementById('mapa');

// Conexión con Socket.IO
const socket = io();

let jugadorId = null;
let enemigoId = null;
let enemigoAtaques = null;
let mokepones = [];
let mokeponesEnemigos = [];
let ataquePlayer = [];
let attackEnemi = [];
let opcionDeMokepones;
let inputHipodoge;
let inputCapipepo;
let inputRatigueya;
let mascotaPlayer;
let petPlayerObjeto;
let ataquesMokepon;
let ataquesMokeponEnemi;
let botonFuego;
let botonAgua;
let botonTierra;
let botones = [];
let indexAtaquePl;
let indexAtaqueEn;
let victoriasPlayer = 0;
let victoriasEnemi = 0;
let lienzo = mapa.getContext("2d");
let intervalo;
let mapaBackground = new Image();
mapaBackground.src = './assets/mokemap.png';
let alturaBuscada;
let anchoDelMapa = window.innerWidth - 20;
const anchoMaximoMapa = 450;
let combateEnProgreso = false;

if (anchoDelMapa > anchoMaximoMapa) {
    anchoDelMapa = anchoMaximoMapa - 20;
}

alturaBuscada = anchoDelMapa * 600 / 800;

mapa.width = anchoDelMapa;
mapa.height = alturaBuscada;

aleatorio = (min, max)=>{
    return Math.floor(Math.random() * (max - min + 1) + min)
}

class Mokepon {
    constructor(nombre, foto, vida, fotoMapa, id = null){
        this.id = id;
        this.nombre = nombre;
        this.foto = foto;
        this.vida = vida;
        this.ataques = [];
        this.ancho = 40;
        this.alto = 40;
        this.x = aleatorio(0, mapa.width - this.ancho);
        this.y = aleatorio(0, mapa.height - this.alto);
        this.mapafoto = new Image();
        this.mapafoto.src = fotoMapa;
        this.velocidadX = 0;
        this.velocidadY = 0;
    }
    pintarMokepon() {
        lienzo.drawImage(
        this.mapafoto,
        this.x,
        this.y,
        this.alto,
        this.ancho,
        );
    }
}

let hipodoge = new Mokepon ('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png');

let capipepo = new Mokepon ('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png');

let ratigueya = new Mokepon ('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png');

// let hipodogeEnemi = new Mokepon ('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png');

// let capipepoEnemi = new Mokepon ('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png');

// let ratigueyaEnemi = new Mokepon ('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png');

const HIPODOGE_ATAQUES = [
    {nombre: '💧', id:"btn-agua"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🌱', id:"btn-tierra"}
]

const CAPIPEPO_ATAQUES = [
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🔥', id:"btn-fuego"}
]

const RATIGUEYA_ATAQUES = [
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🌱', id:"btn-tierra"}
]

hipodoge.ataques.push(...HIPODOGE_ATAQUES);

// hipodogeEnemi.ataques.push(...HIPODOGE_ATAQUES);

capipepo.ataques.push(...CAPIPEPO_ATAQUES);

// capipepoEnemi.ataques.push(...CAPIPEPO_ATAQUES);

ratigueya.ataques.push(...RATIGUEYA_ATAQUES);

// ratigueyaEnemi.ataques.push(...RATIGUEYA_ATAQUES);

mokepones.push(hipodoge, capipepo, ratigueya);

iniciarJuego = ()=>{
    
    btnRplay.style.display = 'none';
    sectionSelectAttack.style.display = 'none';
    sectionMapa.style.display = 'none';

    mokepones.forEach((mokepon)=>{
        opcionDeMokepones = `
        <input type="radio" name="mascota" id=${mokepon.nombre} />
            <label class="tarjeta-pet" for=${mokepon.nombre}>
                <p>${mokepon.nombre}</p>
                <img src=${mokepon.foto} alt=${mokepon.nombre}>
            </label>
            `
            contenedorTarjetas.innerHTML += opcionDeMokepones;

            inputHipodoge = document.getElementById('Hipodoge');
            inputCapipepo = document.getElementById('Capipepo');
            inputRatigueya = document.getElementById('Ratigueya');
    });

    botonMascotaJugador.addEventListener('click',seleccionarMascotaJugador);

    botonReiniciar.addEventListener('click', replayGame);

    unirseAlJuego();
}

unirseAlJuego = ()=> {
    socket.emit("unirse");
    
    // Todos los listeners se registran UNA SOLA VEZ aquí
    socket.on("id-asignado", (id) => {
        jugadorId = id;
        console.log("ID asignado:", jugadorId);
    });

    // Escuchar actualizaciones de enemigos para el mapa
    socket.on("actualizar-enemigos", (enemigos) => {
        console.log("Enemigos actualizados:", enemigos);
        
        // Limpiar y recrear la lista de enemigos
        mokeponesEnemigos = [];
        
        enemigos.forEach(function(enemigo){
            if (enemigo.mokepon != undefined) {
                const mokeponNombre = enemigo.mokepon.nombre;
                let mokeponEnemigo = null;
                
                // Crear nuevo mokepon enemigo
                if (mokeponNombre == "Hipodoge") {
                    mokeponEnemigo = new Mokepon('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png', enemigo.id);
                } else if (mokeponNombre == "Capipepo") {
                    mokeponEnemigo = new Mokepon('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png', enemigo.id);
                } else if (mokeponNombre == "Ratigueya") {
                    mokeponEnemigo = new Mokepon('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png', enemigo.id);
                }
                
                // Posición inicial lejana para enemigos nuevos
                if (mokeponEnemigo) {
                    const lado = Math.random();
                    if (lado < 0.5) {
                        mokeponEnemigo.x = mapa.width - 100;
                    } else {
                        mokeponEnemigo.x = 50;
                    }
                    mokeponEnemigo.y = aleatorio(50, mapa.height - 100);
                    
                    // Actualizar con posición del servidor si disponible
                    if (enemigo.x !== undefined && enemigo.y !== undefined) {
                        mokeponEnemigo.x = enemigo.x;
                        mokeponEnemigo.y = enemigo.y;
                    }
                    
                    mokeponesEnemigos.push(mokeponEnemigo);
                    console.log("Enemigo creado:", mokeponNombre, "ID:", enemigo.id);
                }
            }
        });
    });

    // Listener para ataques del enemigo (registrado UNA SOLA VEZ)
    socket.on("ataques-enemigo", (ataques) => {
        console.log("Ataques recibidos del enemigo:", ataques);
        if (ataques && ataques.length === 5) {
            console.log("Ataques válidos recibidos. Procesando combate...");
            attackEnemi = ataques;
            clearInterval(intervalo);
            
            // Permitir que se procese el combate incluso si combateEnProgreso es true
            // porque esto significa que estamos en la fase de selección de ataques
            if (ataquePlayer && ataquePlayer.length === 5) {
                console.log("Tenemos ataques del jugador. Iniciando combate...");
                combate();
            } else {
                console.warn("Ataques del enemigo recibidos pero aún no tenemos ataques del jugador");
            }
        } else {
            console.warn("Ataques inválidos o incompletos:", ataques?.length);
        }
    });
}

seleccionarMascotaJugador = ()=>{
    
    if (inputHipodoge.checked) {
        petPlayer.innerHTML = inputHipodoge.id;
        mascotaPlayer = inputHipodoge.id;
    }else if (inputCapipepo.checked) {
        petPlayer.innerHTML = inputCapipepo.id;
        mascotaPlayer = inputCapipepo.id;
    }else if (inputRatigueya.checked) {
        petPlayer.innerHTML = inputRatigueya.id;
        mascotaPlayer = inputRatigueya.id;
    }else{
        alert('No has seleccionado ninguna mascota');
        return
    }

    sectionSelectPet.style.display = 'none';

    selecionarMokepon(mascotaPlayer);
    
    extraerAtaques(mascotaPlayer);
    sectionMapa.style.display = 'flex';
    iniciarMapa();
}

selecionarMokepon = (mascotaPlayer) => {
    socket.emit("seleccionar-mokepon", {
        jugadorId: jugadorId,
        mokepon: mascotaPlayer
    });
}

extraerAtaques = (mascotaPlayer)=> {
    let ataques;
    for (let i = 0; i < mokepones.length; i++) {
        if (mascotaPlayer == mokepones[i].nombre) {
            ataques = mokepones[i].ataques;
        }
        
    }
    mostrarAtaques(ataques);
}

mostrarAtaques = (ataques)=> {
    ataques.forEach((ataque)=> {
        ataquesMokepon = `
        <button class="btn BAtaque" id=${ataque.id}>${ataque.nombre} </button>
        `
        contenedorAtaques.innerHTML += ataquesMokepon
    })
     botonFuego = document.getElementById('btn-fuego');
     botonAgua = document.getElementById('btn-agua');
     botonTierra = document.getElementById('btn-tierra');
     botones = document.querySelectorAll('.BAtaque');

}

secuenciaAtaque = ()=> {
    botones.forEach((boton) => {
        boton.addEventListener('click', (e) => {
            if (e.target.innerText == "🔥") {
                ataquePlayer.push('FUEGO');
                console.log(ataquePlayer);
                boton.style.background = '#112f58'
                boton.disabled = true;
            }else if (e.target.innerText == "💧") {
                ataquePlayer.push('AGUA');
                console.log(ataquePlayer);
                boton.style.background = '#112f58'
                boton.disabled = true;
            }else {
                ataquePlayer.push('TIERRA');
                console.log(ataquePlayer);
                boton.style.background = '#112f58'
                boton.disabled = true;
            }
            // ataqueEnemi();
            if (ataquePlayer.length == 5) {
                enviarAtaques()
            }
        })
    })
}

enviarAtaques = ()=> {
    console.log("Enviando ataques:", ataquePlayer);
    socket.emit("enviar-ataques", {
        jugadorId: jugadorId,
        ataques: ataquePlayer
    });
    console.log("Esperando ataques del enemigo...");
}

seleccionarPetEnemi = (enemigo)=>{
    petEnemi.innerHTML = enemigo.nombre;
    ataquesMokeponEnemi = enemigo.ataques;

    // let randomPet = aleatorio(0, mokepones.length -1);

    // petEnemi.innerHTML = mokepones[randomPet].nombre;
    // ataquesMokeponEnemi = mokepones[randomPet].ataques;

    secuenciaAtaque();
}


ataqueEnemi = ()=>{
    console.log(ataquesMokeponEnemi);
    let randomAttack = aleatorio(0, ataquesMokeponEnemi.length -1);
    let ataque = ataquesMokeponEnemi[randomAttack].nombre;
    ataquesMokeponEnemi.splice(randomAttack, 1);

    if (ataque == "💧") {
        attackEnemi.push('AGUA');
    }else if (ataque == "🔥") {
        attackEnemi.push('FUEGO');
    }else{
        attackEnemi.push('TIERRA');
    }
    console.log(attackEnemi);
    iniciarPelea();
}

iniciarPelea = ()=> {
    if (ataquePlayer.length == 5) {
    combate();
    }
}

indexOponentes = (player, enemi)=> {
    indexAtaquePl = ataquePlayer[player];
    indexAtaqueEn = attackEnemi[enemi];
}

combate = ()=> {
    console.log("=== INICIANDO COMBATE ===");
    console.log("Ataques jugador:", ataquePlayer);
    console.log("Ataques enemigo:", attackEnemi);
    
    // Validar que tenemos ataques
    if (!ataquePlayer || ataquePlayer.length !== 5 || !attackEnemi || attackEnemi.length !== 5) {
        console.error("Ataques incompletos. Jugador:", ataquePlayer?.length, "Enemigo:", attackEnemi?.length);
        menuMensajeFinal('ERROR: Ataques incompletos');
        return;
    }
    
    clearInterval(intervalo);
    
    // Limpiar resultados anteriores
    resultadoPlayer.innerHTML = '';
    resultadoEnemi.innerHTML = '';
    sectionMensaje.innerHTML = '';
    
    // Contar victorias de esta batalla
    let victoriasEstaBatalla = 0;
    let derrotasEstaBatalla = 0;
    let empatesEstaBatalla = 0;
    let resultadoCombate = '';
    
    for (let index = 0; index < ataquePlayer.length; index++) {
        indexOponentes(index, index);
        
        console.log(`Ronda ${index + 1}: ${ataquePlayer[index]} vs ${attackEnemi[index]}`);
        
        if (ataquePlayer[index] == attackEnemi[index]) {
            resultadoCombate += `<div>Ronda ${index + 1}: EMPATASTE ✌️</div>`;
            empatesEstaBatalla++;
        }else if ((ataquePlayer[index] == 'AGUA' && attackEnemi[index] == 'FUEGO') || (ataquePlayer[index] == 'FUEGO' && attackEnemi[index] == 'TIERRA') || (ataquePlayer[index] == 'TIERRA' && attackEnemi[index] == 'AGUA')) {
            resultadoCombate += `<div>Ronda ${index + 1}: GANASTE 😎</div>`;
            victoriasEstaBatalla++;
            victoriasPlayer++;
            spanVidasPlayer.innerHTML = victoriasPlayer;
        }else {
            resultadoCombate += `<div>Ronda ${index + 1}: PERDISTE 😭</div>`;
            derrotasEstaBatalla++;
            victoriasEnemi++;
            spanVidasEnemi.innerHTML = victoriasEnemi;
        }
        
        // Mostrar ataques usados
        let nuevoAtaquePlayer = document.createElement('p');
        let nuevoAtaqueEnemi = document.createElement('p');
        nuevoAtaquePlayer.innerHTML = indexAtaquePl;
        nuevoAtaqueEnemi.innerHTML = indexAtaqueEn;
        resultadoPlayer.appendChild(nuevoAtaquePlayer);
        resultadoEnemi.appendChild(nuevoAtaqueEnemi);
    }
    
    resultadoCombate += `<div style="margin-top: 10px; font-weight: bold;">─────────────────────</div>`;
    resultadoCombate += `<div style="margin-top: 10px;">TU PUNTUACIÓN: ${victoriasEstaBatalla} | ENEMIGO: ${derrotasEstaBatalla}</div>`;
    
    sectionMensaje.innerHTML = resultadoCombate;
    revisarVictorias(victoriasEstaBatalla, derrotasEstaBatalla, empatesEstaBatalla);
}


revisarVictorias = (victorias, derrotas, empates)=> {
    console.log("Resultado batalla - Victorias:", victorias, "Derrotas:", derrotas, "Empates:", empates);
    
    let mensaje = '';
    if (victorias > derrotas) {
        mensaje = '¡GANASTE LA BATALLA! 🔥😎';
    } else if (derrotas > victorias) {
        mensaje = '¡PERDISTE LA BATALLA! 💔😭';
    } else {
        mensaje = '¡EMPATE EN LA BATALLA! ✌️';
    }
    
    menuMensajeFinal(mensaje);
}

menuMensajeFinal = (resultFinal)=> {
    console.log("Mostrando mensaje final:", resultFinal);
    btnRplay.style.display = 'block';
    sectionMensaje.innerHTML += `<div style="margin-top: 20px; font-size: 1.5em; font-weight: bold; padding: 20px; border: 2px solid gold;">${resultFinal}</div>`;
}

crearMensaje = (resultado)=> {
    // Esta función ahora se usa internamente en combate()
    // Se mantiene por compatibilidad pero no hace nada
    console.log("Mensaje de combate:", resultado);
}

mensajeFinal = (resultFinal)=> {
    // Mantener por compatibilidad pero usar menuMensajeFinal en su lugar
    menuMensajeFinal(resultFinal);
}




replayGame = ()=>{
    try {
        console.log("=== REINICIANDO JUEGO ===");
        // Limpiar arrays y estado de combate
        ataquePlayer = [];
        attackEnemi = [];
        combateEnProgreso = false;
        enemigoId = null;
        enemigoAtaques = null;
        
        // IMPORTANTE: Limpiar enemigos para evitar colisiones inmediatas
        mokeponesEnemigos = [];
        
        // Borrar resultados y mensajes anteriores
        resultadoPlayer.innerHTML = '';
        resultadoEnemi.innerHTML = '';
        sectionMensaje.innerHTML = 'Buscando nuevos enemigos...';
        btnRplay.style.display = 'none';
        
        // Limpiar contenedor de ataques
        contenedorAtaques.innerHTML = '';
        
        // Volver a la pantalla del mapa
        sectionSelectAttack.style.display = 'none';
        sectionMapa.style.display = 'flex';
        
        // Reiniciar el intervalo de movimiento
        if (intervalo) clearInterval(intervalo);
        intervalo = setInterval(pintarCanvas, 50);
        
        console.log("Juego reiniciado. Estado limpio.");
    } catch (error) {
        console.error("Error en replayGame:", error);
        alert("Error al reiniciar el juego: " + error.message);
    }
}

pintarCanvas = ()=> {
    petPlayerObjeto.x = petPlayerObjeto.x + petPlayerObjeto.velocidadX;
    petPlayerObjeto.y = petPlayerObjeto.y + petPlayerObjeto.velocidadY;
    lienzo.clearRect(0, 0, mapa.clientWidth, mapa.height);
    lienzo.drawImage(
        mapaBackground,
        0,
        0,
        mapa.width,
        mapa.height
    );
    petPlayerObjeto.pintarMokepon()

    enviarPosicion(petPlayerObjeto.x, petPlayerObjeto.y)

    mokeponesEnemigos.forEach(function(mokepon) {
        if (mokepon != undefined) {
            mokepon.pintarMokepon()
            revisarColision(mokepon)
        }
    })

    // hipodogeEnemi.pintarMokepon();
    // capipepoEnemi.pintarMokepon();
    // ratigueyaEnemi.pintarMokepon();

    // if(petPlayerObjeto.velocidadX !== 0 || petPlayerObjeto.velocidadY !== 0) {
    //     revisarColision(hipodogeEnemi);
    //     revisarColision(capipepoEnemi);
    //     revisarColision(ratigueyaEnemi);
    // }
}

enviarPosicion = (x, y)=> {
    socket.emit("enviar-posicion", {
        jugadorId: jugadorId,
        x: x,
        y: y
    });
}

moverDerecha = ()=> {
    petPlayerObjeto.velocidadX = 5;
}

moverIzquierda = ()=> {
    petPlayerObjeto.velocidadX = -5;
}

moverArriba = ()=> {
    petPlayerObjeto.velocidadY = -5;
}

moverAbajo = ()=> {
    petPlayerObjeto.velocidadY = 5;
}

detenerMovimiento = ()=> {
    petPlayerObjeto.velocidadX = 0;
    petPlayerObjeto.velocidadY = 0;
}

pressTecla = (event)=> {
    switch (event.key) {
        case 'ArrowUp':
            moverArriba();
            break;
        
        case 'ArrowDown':
            moverAbajo();
            break;
        
        case 'ArrowLeft':
            moverIzquierda();
            break;

        case 'ArrowRight':
            moverDerecha();
            break;

        default:
            break;
    }
}

iniciarMapa = ()=> {
    petPlayerObjeto = obtenerObjetoPet(mascotaPlayer);
    intervalo = setInterval(pintarCanvas, 50);

    window.addEventListener('keydown', pressTecla);
    window.addEventListener('keyup', detenerMovimiento);
}

obtenerObjetoPet = ()=> {
    for (let i = 0; i < mokepones.length; i++) {
        if (mascotaPlayer == mokepones[i].nombre) {
            return mokepones[i];
        }
        
    }
}

revisarColision = (enemigo)=> {
    // Evitar colisión si ya estamos en combate
    if (combateEnProgreso) {
        return;
    }

    // Aumentar distancia mínima de colisión (40 píxeles para evitar colisiones inmediatas)
    const distanciaMinima = 40;
    const arribaEnemigo = enemigo.y - distanciaMinima;
    const abajoEnemigo = enemigo.y + enemigo.alto + distanciaMinima;
    const derechaEnemigo = enemigo.x + enemigo.ancho + distanciaMinima;
    const izquierdaEnemigo = enemigo.x - distanciaMinima;

    const arribaMascota = petPlayerObjeto.y;
    const abajoMascota = petPlayerObjeto.y + petPlayerObjeto.alto;
    const derechaMascota = petPlayerObjeto.x + petPlayerObjeto.ancho;
    const izquierdaMascota = petPlayerObjeto.x;
    if (
        abajoMascota < arribaEnemigo ||
        arribaMascota > abajoEnemigo ||
        derechaMascota < izquierdaEnemigo ||
        izquierdaMascota > derechaEnemigo
    ) {
        return;
    }

    if(enemigo.x == undefined || enemigo.y == undefined){
        console.warn("Enemigo sin posición:", enemigo);
        return
    }
    
    console.log("¡COLISIÓN DETECTADA CON:", enemigo.id);
    // Iniciar combate
    combateEnProgreso = true;
    detenerMovimiento();
    if (intervalo) clearInterval(intervalo);

    enemigoId = enemigo.id

    sectionSelectAttack.style.display = 'flex';
    sectionMapa.style.display = 'none';
    seleccionarPetEnemi(enemigo);
}

window.addEventListener('load', iniciarJuego);