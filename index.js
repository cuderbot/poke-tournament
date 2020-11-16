const axios = require('axios');

// Configuracion y constantes
const config = {
    pokemonToUse: 8,
    range: {
        min: 1,
        max: 151
    },
    baseUrl: 'https://pokeapi.co/api/v2/pokemon'
}

// Objeto que contiene los dialogos para cosas varias
const dialog = {
    spacer: () => console.log('====================='),
    turn: (turnNum) => {
        console.log('=====================');
        console.log(`Turno: ${turnNum}`)
    },
    showStats: (pkmn) => console.log(`<Pokemon: ${pkmn.name} | hp: ${pkmn.stats.hp} | attack: ${pkmn.stats.attack} | defense: ${pkmn.stats.defense} | speed: ${pkmn.stats.speed}>`),
    init: (name) => {
        console.log(`${name} es quien toma la iniciativa, y ataca primero.`);
        console.log('---------');
    },
    attack: (pkmn1Name, pkmn2Name, dmg) => console.log(`${pkmn1Name} ha atacado a ${pkmn2Name} y hecho ${dmg} de daño!!!!`),
    fainted: (pkmn) =>  console.log(`OH NO !!! ${pkmn} ha caido en combate :c`),
    moveIn: (pkmns) => {
        console.log('Los siguientes pokemon avanzan: !!');
        pkmns.map((pokemon,i ) => console.log({ 'Participante Num:': i+1, 'Nombre': pokemon.name}));
    }
}

const types = [
    {name: 'normal', isSP: false},
    {name: 'fighting', isSP: false},
    {name: 'flying', isSP: false},
    {name: 'poison', isSP: true},
    {name: 'ground', isSP: true},
    {name: 'rock', isSP: true},
    {name: 'bug', isSP: true},
    {name: 'ghost', isSP: true},
    {name: 'steel', isSP: true},
    {name: 'fire', isSP: true},
    {name: 'water', isSP: true},
    {name: 'grass', isSP: true},
    {name: 'electric', isSP: true},
    {name: 'psychic', isSP: true},
    {name: 'ice', isSP: true},
    {name: 'dragon', isSP: true},
    {name: 'dark', isSP: true},
    {name: 'fairy', isSP: true},
]

class Pokemon {
    constructor(id, name, types, hp, attack, defense, spAttack, spDefense, speed) {
        this.id = id;
        this.name = name;
        this.types = types;
        this.currentHP = hp;
        this.isFainted = false;
        this.stats = {
            hp,
            attack,
            defense,
            spAttack,
            spDefense,
            speed
        };
    }

    setDamage(dmg) {
        const actualDmg = (dmg - this.stats.defense) >= 0 ? (dmg - this.stats.defense) : 10;
        this.currentHP -= actualDmg;
        console.debug({ defense: this.stats.defense, dmg, actualDmg, currentHP: this.currentHP, hp: this.stats.hp});
        if (this.currentHP <= this.hp || this.currentHP <= 0) {
            this.isFainted = true;
        }
        return actualDmg;
    }

}

// Funcion para obtener los datos del pokemon parseados
const getPokemon = async (id) => {
    const {data} = await axios.get(`${config.baseUrl}/${id}`);
    if (data) {
        const stats = data.stats ? data.stats
        .map(stat => ({name: stat.stat.name, value: stat.base_stat}))
        .reduce((obj, value) => {
            obj[value.name] = value.value;
            return obj;
        }, {}) : null;
        return new Pokemon(
            data.id ? data.id : null,
            data.name ? data.name : '',
            data.types ? data.types && data.types.map(type => type.type.name) : [],
            stats && stats.hp ? stats.hp : 0,
            stats && stats.attack ? stats.attack : 0,
            stats && stats.defense ? stats.defense : 0,
            stats && stats['special-attack'] ? stats['special-attack'] : 0,
            stats && stats['special-defense'] ? stats['special-defense'] : 0,
            stats && stats.speed ? stats.speed : 0
        )
    }
    return null;
}

// Funcion para hechar a pelear los meones digo los pokemon
const combat = (pkmn1, pkmn2) => {
    let turnNum = 1;
    dialog.showStats(pkmn1);
    dialog.showStats(pkmn2);

    // Revisando quien va a comenzar a atacar primero
    const isPkmn1AttackingFirst = pkmn1.stats.speed >= pkmn2.stats.speed ? true : false;
    dialog.init(isPkmn1AttackingFirst ? pkmn1.name : pkmn2.name);
    while (true) {
        dialog.turn(turnNum);
        if (isPkmn1AttackingFirst) {
            turn(pkmn1, pkmn2);
            if (pkmn1.isFainted || pkmn2.isFainted) {
                break;
            }
        } else {
            turn(pkmn2, pkmn1);
            if (pkmn1.isFainted || pkmn2.isFainted) {
                break;
            }
        }
        turnNum++;
        dialog.spacer();
        if (turnNum == 50) {
            break;
        }
        delay(15000);
    }
    console.log('---------\n');
    if (pkmn1.isFainted) {
        return pkmn2.id;
    } else if (pkmn2.isFainted) {
        return pkmn1.id;
    }
}

// Funcion que hace que peleen los pkmn
const turn = (pkmn1, pkmn2 ) => {
    let dmg = 0;
    dmg = pkmn2.setDamage(pkmn1.stats.attack);
    dialog.attack(pkmn2.name, pkmn1.name, dmg);
    if (pkmn2.isFainted) {
        dialog.fainted(pkmn2.name);
        return true;
    }
    dmg = pkmn1.setDamage(pkmn2.stats.attack);
    dialog.attack(pkmn1.name, pkmn2.name, dmg)
    if (pkmn1.isFainted) {
        dialog.fainted(pkmn1.name);
        return true
    }
}

/**
 * Utils
 * 
 */
// Funcion para obtener el rango
const getRandomInt = () => Math.floor(Math.random() * (config.range.max - config.range.min)) + config.range.min;

// Funcion para hacer delay
const delay = (ms) => setTimeout(() => {}, ms);

/**
 * Main function
 */
const main = async () => {
    // Se obtienen los pokemon
    let promises = [];
    for (const i of [...Array(config.pokemonToUse).keys()]) {
        const id = getRandomInt();
        const promise = getPokemon(id);
        promises.push(promise);
    }
    let pokemons = await Promise.all(promises);
    // Se muestra los pokemon a participar
    if (pokemons) {
        pokemons.map((pokemon, i) => console.log({ 'Participante Num:': i+1, 'Nombre': pokemon.name}));
        console.log('\n\n\n');
        let nexts = [];
        for (let i = 0; i < pokemons.length; i++) {
            const id = combat(pokemons[i], pokemons[++i]);
            console.log(`${pokemons.find(pkmn => pkmn.id === id).name} avanza en el torneo`);
            nexts.push(pokemons.find(pkmn => pkmn.id === id));
            console.log('\n\n\n ========================')
        }
        let aux = [];
        while (nexts.length == 1) {
            dialog.moveIn(nexts);
            for (let i = 0; i < nexts.length; i++) {
                const id = combat(nexts[i], nexts[++i]);
                console.log(`${nexts.find(pkmn => pkmn.id === id).name} avanza en el torneo`);
                console.log('\n\n\n ========================')
                aux.push(nexts.find(pkmn => pkmn.id === id));
            }
            nexts = aux;
        }
    }
}


if (require.main === module) {
    main();
}