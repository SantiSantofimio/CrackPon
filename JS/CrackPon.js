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

let mokepones = [];
let ataquePlayer = [];
let attackEnemi = [];
let opcionDeMokepones;
let inputHipodoge;
let inputCapipepo;
let inputRatigueya;
let mascotaPlayer;
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

class Mokepon {
    constructor(nombre, foto, vida){
        this.nombre = nombre;
        this.foto = foto;
        this.vida = vida;
        this.ataques = [];
    }
}

let hipodoge = new Mokepon ('Hipodoge', './assets/mokepons_mokepon_hipodoge_attack.png', 5);

let capipepo = new Mokepon ('Capipepo', './assets/mokepons_mokepon_capipepo_attack.png', 5);

let ratigueya = new Mokepon ('Ratigueya', './assets/mokepons_mokepon_ratigueya_attack.png', 5);

hipodoge.ataques.push(
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

ratigueya.ataques.push(
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '🔥', id:"btn-fuego"},
    {nombre: '💧', id:"btn-agua"},
    {nombre: '🌱', id:"btn-tierra"}
);

mokepones.push(hipodoge, capipepo, ratigueya);

aleatorio = (min, max)=>{
    return Math.floor(Math.random() * (max - min + 1) + min)
}

iniciarJuego = ()=>{
    
    btnRplay.style.display = 'none';
    sectionSelectAttack.style.display = 'none';

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
}

seleccionarMascotaJugador = ()=>{
    
    sectionSelectPet.style.display = 'none';

    sectionSelectAttack.style.display = 'flex';

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
    
    extraerAtaques(mascotaPlayer);
    seleccionarPetEnemi();
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

seleccionarPetEnemi = ()=>{
    let randomPet = aleatorio(0, mokepones.length -1);

    petEnemi.innerHTML = mokepones[randomPet].nombre;
    ataquesMokeponEnemi = mokepones[randomPet].ataques;

    secuenciaAtaque();
}


ataqueEnemi = ()=>{
    let randomAttack = aleatorio(0, ataquesMokeponEnemi.length -1);

    if (randomAttack == 0 || randomAttack == 1) {
        attackEnemi.push('AGUA');
    }else if (randomAttack == 3 || randomAttack == 4) {
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

window.addEventListener('load', iniciarJuego);