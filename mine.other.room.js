let isRoomAvailable = function(flag) {
    try {
        flag.pos.findInRange(FIND_MY_STRUCTURES, 0);
    }
    catch(err) {
        return false;
    }
    return true;
}

let isStarted = function(flag) {
    if (!isRoomAvailable(flag)) return false;
    return (flag.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 0).length ||
        flag.pos.findInRange(FIND_MY_STRUCTURES, 0).length) > 0;
}

let checkScout = function(flag) {
    if (_.filter(Game.creeps, c => c.memory.room === flag.pos.roomName).length == 0) {
        Game.spawns.Spawn1.createCreep([MOVE], undefined, {room: flag.pos.roomName});
    }
}

let defaultCostMatrix = function(roomName, ignoreCreeps=false) {
    let room = Game.rooms[roomName];
    if (!room) return;
    let costs = new PathFinder.CostMatrix;
    
    room.find(FIND_STRUCTURES).forEach(function(struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            costs.set(struct.pos.x, struct.pos.y, 1);
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
}

let ignoreCreepsCostMatrix = function(roomName) {
    return defaultCostMatrix(roomName, true);
}

let buildInfrastructure = function(flag) {
    let path = PathFinder.search(
        Game.spawns.Spawn1.pos, 
        flag.pos,
        {
            plainCost: 2,
            swampCost: 10,
            roomCallback: ignoreCreepsCostMatrix
        }
    ).path; 
    console.log(p)//.createConstructionSite(STRUCTURE_ROAD))
}

module.exports = mor;
