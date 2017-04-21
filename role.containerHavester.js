let con = require('constants');
let utils = require('utils');

/**
 * @param {Room} room
 * @return int: index of container whose harvester is dead or will die soon
 */
function chooseContainerIndex(room) {
    let ticksToRevive = 60;
    let existingCreepIndexes = _.filter(Game.creeps, (creep) =>
        creep.memory.role === 'containerHarvester'
        && creep.memory.room === room.name
        && creep.ticksToLive > ticksToRevive
    ).map((creep) => creep.memory.containerIndex);
    let indexesCount = utils.getSourceContainers(room, true).length;
    for (let i = 0; i < indexesCount; i++) {
        if (existingCreepIndexes.indexOf(i) === -1) {
            return i;
        }
    }
    return -1;
}


let roleContainerHarvester = {

    /** ContainerHarvester logic.
     * Goes to related container and harvest from source to it.
     * @param {Creep} creep
     * **/
    run: function (creep) {
        let container = utils.getSourceContainers(
            creep.room)[creep.memory.containerIndex];
        if (!creep.pos.isEqualTo(container)) {
            creep.moveTo(container);
        } else {
            let source = creep.pos.findInRange(FIND_SOURCES, 1)[0];
            creep.harvest(source);
        }
    },

    /**
     * Creation of containerHarvester.
     * This creep designed to fully harvest full source by itself.
     * Binded to appropriate container.
     */
    create: function (room=con.room, budget=false) {
        let spawns = _.filter(
            Game.spawns, sp => sp.room == room && !sp.spawning);
        if (spawns.length <= 0) return false;
        let spawn = spawns[0];

        let work = budget ? (room.energyCapacityAvailable - 50)/100>>0 : 5;
        if (work < 2) {return false;}
        let body = Array(work).fill(WORK);
        let availableEnergy = room.energyAvailable - budget?200:500;
        let containerIndex = chooseContainerIndex(room);
        let moveCount;

        if (containerIndex === -1) {
            return false;
        }
        if (availableEnergy < 50) {
            console.log('Not Enough energry for containerHarvester');
            return false;
        }
        moveCount = Math.min(2, availableEnergy / 50 << 0);
        body = body.concat(Array(moveCount).fill(MOVE));
        let newName = spawn.createCreep(
            body, undefined, {
                role: 'containerHarvester',
                containerIndex: containerIndex,
                room: room.name
            });
        console.log(
            `Spawning new containerHarvester[${containerIndex}]: ${newName}
             at ${room} room.`);
    },

    /**
     * @return boolean: true if room is available for containerHarvester
     */
    isContainerHarvesterAvailable: function (room=con.room) {
        return utils.getSourceContainers(room).length > 0;
    }
};

module.exports = roleContainerHarvester;