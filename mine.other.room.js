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
        if (struct.structureType === STRUCTURE_ROAD && !ignoreRoads) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
        }
        if (struct.structureType !== STRUCTURE_CONTAINER &&
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
    return defaultCostMatrix(roomName, true);
};


let buildInfrastructure = function(flag) {
    if (!isRoomAvailable(flag)) return false;
    if (flag.memory.infrastructureBuilded) return true;
    let path = PathFinder.search(
        Game.spawns.Spawn1.pos, 
        flag.pos,
        {
            plainCost: 1,
            swampCost: 2,
            roomCallback: ignoreCreepsAndRoadsCostMatrix
        }
    ).path;
    path.forEach(pos => {
        try {
            pos.createConstructionSite(STRUCTURE_ROAD);
        }
        catch(err) {
            console.log(`Cannot build road in ${pos}. \n${err}`);
        }
    });
    try {
        if (flag.pos.createConstructionSite(STRUCTURE_CONTAINER) === OK) {
            flag.memory.infrastructureBuilded = true;
        }
    }
    catch(err) {
        console.log(`Cannot build container in ${pos}. \n${err}`);
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
    if (_.filter(Game.creeps, c => c.memory.room === flag.pos.roomName && c.isRoleClaimer()).length === 0) {
        roleClaimer.create(flag);
    }
};


let checkRepairer = function (flag) {
    if (!isRoomAvailable(flag)) return false;
    if (
        _.filter(
            Game.creeps,
            c => c.memory.room === flag.pos.roomName && c.isRepairer()
        ).length < roleRepairer.expectedCount(flag.room, true)
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
            checkClaimer(flag);
            buildInfrastructure(flag);
            checkRepairer(flag);
            checkContainerHarvester(flag);
            checkCarrier(flag);
        }
    )
};

module.exports = {
    runAllMining: runAllMining,
    ignoreCreepsAndRoadsCostMatrix: ignoreCreepsAndRoadsCostMatrix
};
