require('deps');
let mor = require('mine.other.room');

module.exports.loop = function () {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    for (let roomId in Game.rooms) {
        let room = Game.rooms[roomId];
        room.handleCreeps();
    }


    mor.runAllMining();

    for (let spawnId in Game.spawns) {
        let spawn = Game.spawns[spawnId];
        if (spawn.spawning) {
            let spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '#' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    }

    for(let creepId in Game.creeps) {
        let creep = Game.creeps[creepId];
        creep.run();
    }
}