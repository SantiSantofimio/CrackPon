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

let jugadorId = null;
let mokepones = [];
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
    constructor(nombre, foto, vida, fotoMapa){
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

let hipodogeEnemi = new Mokepon ('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5, './assets/hipodoge.png');

let capipepoEnemi = new Mokepon ('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5, './assets/capipepo.png');

let ratigueyaEnemi = new Mokepon ('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5, './assets/ratigueya.png');

hipodoge.ataques.push(
    {nombre: '💧', id:"btn-agua"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🌱', id:"btn-tierra"}
);

hipodogeEnemi.ataques.push(
    {nombre: '💧', id:"btn-agua"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🌱', id:"btn-tierra"}
);

capipepo.ataques.push(
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🔥', id:"btn-fuego"}
);

capipepoEnemi.ataques.push(
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '🌱', id:"btn-tierra"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🔥', id:"btn-fuego"}
);

ratigueya.ataques.push(
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🌱', id:"btn-tierra"}
);

ratigueyaEnemi.ataques.push(
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🌱', id:"btn-tierra"}
);

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
    fetch("http://localhost:8080/unirse")
        .then(function(res){
            if (res.ok) {
                res.text()
                    .then(function(respuesta){
                        console.log(respuesta);
                        jugadorId = respuesta
                    })
            }
        })
}

seleccionarMascotaJugador = ()=>{
    
    sectionSelectPet.style.display = 'none';
    

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
    }

    selecionarMokepon(mascotaPlayer);
    
    extraerAtaques(mascotaPlayer);
    sectionMapa.style.display = 'flex';
    iniciarMapa();
}

selecionarMokepon = (mascotaPlayer) => {
    fetch(`http://localhost:8080/mokepon/${jugadorId}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            mokepon: mascotaPlayer
        })
    })
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
            ataqueEnemi();

        })
    })
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
    
    for (let index = 0; index < ataquePlayer.length; index++) {
        if (ataquePlayer[index] == attackEnemi[index]) {
            indexOponentes(index, index);
            crearMensaje('EMPATASTE✌️');
        }else if (ataquePlayer[index] == 'AGUA' && attackEnemi[index] == 'FUEGO' || ataquePlayer[index] == 'FUEGO' && attackEnemi[index] == 'TIERRA' || ataquePlayer[index] == 'TIERRA' && attackEnemi[index] == 'AGUA') {
            indexOponentes(index, index);
            crearMensaje('GANASTE😎');
            victoriasPlayer++;
            spanVidasPlayer.innerHTML = victoriasPlayer;
        }else {
            indexOponentes(index, index);
            crearMensaje('PERDISTE😭');
            victoriasEnemi++;
            spanVidasEnemi.innerHTML = victoriasEnemi;
        }
        
    }
    revisarVictorias();
}


revisarVictorias = ()=> {
    if (victoriasEnemi == victoriasPlayer) {
       mensajeFinal('PARECE QUE HAY UN EMPATE!✌️');
    }else if (victoriasPlayer > victoriasEnemi) {
        mensajeFinal('FELICIDADES, HAZ GANADO LA PARTIDA!🔥😎');
    }else {
        mensajeFinal('LO SIENTO, HAZ PERDIDO LA PARTIDA!💔😭');
    }
}

crearMensaje = (resultado)=> {

    let nuevoAtaquePlayer = document.createElement('p');
    let nuevoAtaqueEnemi = document.createElement('p');

    sectionMensaje.innerHTML = resultado;
    nuevoAtaquePlayer.innerHTML = indexAtaquePl;
    nuevoAtaqueEnemi.innerHTML = indexAtaqueEn;

   resultadoPlayer.appendChild(nuevoAtaquePlayer);
   resultadoEnemi.appendChild(nuevoAtaqueEnemi);

}

mensajeFinal = (resultFinal)=> {
    
    btnRplay.style.display = 'block';

    sectionMensaje.innerHTML = resultFinal;

}


replayGame = ()=>{
    location.reload();
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

    hipodogeEnemi.pintarMokepon();
    capipepoEnemi.pintarMokepon();
    ratigueyaEnemi.pintarMokepon();

    if(petPlayerObjeto.velocidadX !== 0 || petPlayerObjeto.velocidadY !== 0) {
        revisarColision(hipodogeEnemi);
        revisarColision(capipepoEnemi);
        revisarColision(ratigueyaEnemi);
    }
}

enviarPosicion = (x, y)=> {
    fetch(`http://localhost:8080/mokepon/${jugadorId}/posicion`, {
        method: "post",
        headers: {
            "Content-Type": "application/JSON"
        },
        body: JSON.stringify({
            x,
            y
        })
    })
    .then(function(res) {
        if (res.ok) {
            res.json()
                .then(function({enemigos}) {
                    console.log(enemigos);
                })
        }
    })
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
    petPlayerObjeto.velocidadY = 0;petPlayerObjeto
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
    const arribaEnemigo = enemigo.y;
    const abajoEnemigo = enemigo.y + enemigo.alto;
    const derechaEnemigo = enemigo.x + enemigo.ancho;
    const izquierdaEnemigo = enemigo.x;

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
    detenerMovimiento();
    clearInterval(intervalo);
    sectionSelectAttack.style.display = 'flex';
    sectionMapa.style.display = 'none';
    seleccionarPetEnemi(enemigo);
}

window.addEventListener('load', iniciarJuego);