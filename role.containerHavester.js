let con = require('constants');

/**
 * @param {Room} room
 * @return int: index of container whose harvester is dead or will die soon
 */
function chooseContainerIndex(room) {
    let existingCreepIndexes = Game.creeps.filter((creep) =>
        creep.memory.role === 'containerHarvester'
            && creep.ticksToLive > 40
    ).map((creep) => creep.memory.containerIndex);
    let indexesCount = getSourceContainers(room, true).length;
    for (let i = 0; i++; i < indexesCount) {
        if (existingCreepIndexes.indexOf(i) === -1) {
            return i;
        }
    }
    return -1;
}


/**
 * Find containers related to sources and store in memory
 * @param {Room} room
 * @param {boolean} update: force memory update
 * @return Array<StructureContainer>
 */
function getSourceContainers(room, update=false) {
    let containers = room.memory.sourceContainers;
    if (!containers || update) {
        containers = room.find(
            FIND_STRUCTURES, {
                filter: structure => {
                    if (structure.structureType !== STRUCTURE_CONTAINER) {
                        return false;
                    }
                    return structure.pos.findInRange(FIND_SOURCES, 1).length >= 1;
                }
            }
        );
        room.memory.sourceContainers = containers;
    }
    return containers;
}


let roleContainerHarvester = {

    /** ContainerHarvester logic.
     * Goes to related container and harvest from source to it.
     * @param {Creep} creep 
     * **/
    run: function(creep) {
        let container = getSourceContainers(creep.room)[creep.memory.index];
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
    create: function() {
        let body = Array(5).fill(WORK);
        let availableEnergy = con.room.energyAvailable - 500;
        let containerIndex = chooseContainerIndex(con.room);
        let moveCount;

        if (containerIndex === -1) {
            return False;
        }
        if (availableEnergy < 50) {
            console.log('Not Enough energry for containerHarvester');
            return False;
        }
        moveCount = Math.min(5, availableEnergy/50<<0);
        body.concat(Array(moveCount).fill(MOVE));
        let newName = Game.spawns['Spawn1'].createCreep(
            body, undefined, {
                role: 'containerHarvester',
                index: containerIndex
            });
        console.log(
            `Spawning new containerHarvester[${containerIndex}]: ${newName}`);
    },

    /**
     * @return boolean: true if room is available for containerHarvester
     */
    isContainerHarvesterAvailable: function() {
        return getSourceContainers(con.room).length > 0;
    }
};

module.exports = roleContainerHarvester;