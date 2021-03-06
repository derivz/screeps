let roleLongCarrier = require('role.longCarrier');
let roleClaimer = require('role.claimer');
let roleRepairer = require('role.repairer');
let roleContainerHarvester = require('role.containerHavester');

let isRoomAvailable = function(flag) {
    try {
        flag.pos.lookFor('structure');
    }
    catch(err) {
        return false;
    }
    return true;
};


let isStarted = function(flag) {
    if (!isRoomAvailable(flag)) return false;
    return (flag.pos.lookFor(LOOK_CONSTRUCTION_SITES).length ||
        flag.pos.lookFor(LOOK_STRUCTURES).length) > 0;
};


let isContainerReady = function(flag) {
    if (!isRoomAvailable(flag)) return false;
    return _.filter(
        flag.pos.lookFor(LOOK_STRUCTURES),
        st => st.structureType === STRUCTURE_CONTAINER).length > 0
};


let defaultCostMatrix = function(roomName, ignoreCreeps=false, ignoreRoads=false) {
    let room = Game.rooms[roomName];
    if (!room) return;
    let costs = new PathFinder.CostMatrix;
    
    room.find(FIND_STRUCTURES).forEach(function(struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            if (!ignoreRoads) {
                costs.set(struct.pos.x, struct.pos.y, 1);
            }
        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            // Can't walk through non-walkable buildings
            costs.set(struct.pos.x, struct.pos.y, 0xff);
        }
    });
    
    // Avoid creeps in the room
    if (!ignoreCreeps) {
        room.find(FIND_CREEPS).forEach(function(creep) {
            costs.set(creep.pos.x, creep.pos.y, 0xff);
        });
    }
    
    return costs;
};

let ignoreCreepsAndRoadsCostMatrix = function(roomName) {
    return defaultCostMatrix(roomName, true, true);
};


let buildInfrastructure = function(flag) {
    if (!isRoomAvailable(flag)) return false;
    if (flag.memory.infrastructureBuilded) return true;
    let errors = 0;
    let path = PathFinder.search(
        flag.closestSpawn().pos,
        flag.pos,
        {
            plainCost: 1,
            swampCost: 2,
            roomCallback: ignoreCreepsAndRoadsCostMatrix
        }
    );
    if (path.incomplete) {
        console.log('Cannot build path');
        return false;
    }
    path.path.forEach(pos => {
        try {
            if (pos.createConstructionSite(STRUCTURE_ROAD) === ERR_FULL) {
                errors++;
            }
        }
        catch(err) {
            console.log(`Cannot build road in ${pos}. \n${err}`);
        }
    });
    try {
        if (flag.pos.createConstructionSite(STRUCTURE_CONTAINER) === ERR_FULL) {
            errors++;
        }
    }
    catch(err) {
        console.log(`Cannot build container in ${pos}. \n${err}`);
    }
    if (errors === 0) {
        flag.memory.infrastructureBuilded = true;
    }
};


let checkScout = function(flag) {
    if (isRoomAvailable(flag)) return false;
    if (_.filter(Game.creeps, c => c.memory.room === flag.pos.roomName).length === 0) {
        Game.spawns.Spawn1.createCreep(
            [MOVE], undefined, {room: flag.pos.roomName});
    }
};


let checkClaimer = function (flag) {
    if (
        _.filter(Game.creeps, c => c.memory.room === flag.pos.roomName && c.isClaimer()).length === 0
        && (!flag.room || flag.room.controller.reservation.ticksToEnd < 1000)
    ) {
        roleClaimer.create(flag);
    }
};


let checkRepairer = function (flag) {
    if (!isRoomAvailable(flag)) return false;
    if (
        _.filter(
            Game.creeps,
            c => c.memory.room === flag.pos.roomName && c.isRepairer()
        ).length < roleRepairer.expectedCount(flag.room, true, true)
    ) {
        roleRepairer.create(flag.room, true);
    }
};


let checkContainerHarvester = function (flag) {
    if (!isContainerReady(flag)) return false;
    if (roleContainerHarvester.isContainerHarvesterAvailable(flag.room)) {
        roleContainerHarvester.create(flag.room, false, flag.closestSpawn());
    }
};


let checkCarrier = function (flag) {
    if (!isContainerReady(flag)) return false;
    if (!roleContainerHarvester.isContainerHarvesterAvailable(flag.room)) {
        return false;
    }
    if (_.filter(
            Game.creeps,
            c => c.memory.room === flag.pos.roomName && c.isLongCarrier()
        ).length === 0
    ) {
        roleLongCarrier.create(flag.room, flag.closestSpawn());
    }
};


let runAllMining = function () {
    _.filter(Game.flags, x => x.isSourceFlag()).forEach(
        flag => {
            let spRoom = flag.closestSpawn().room;
            if (spRoom.energyAvailable > spRoom.energyCapacityAvailable - 500) {
                checkClaimer(flag);
                buildInfrastructure(flag);
                checkRepairer(flag);
                checkContainerHarvester(flag);
                checkCarrier(flag);
            }
        }
    )
};

module.exports = {
    runAllMining: runAllMining,
    ignoreCreepsAndRoadsCostMatrix: ignoreCreepsAndRoadsCostMatrix
};
