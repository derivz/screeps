let con = require('constants');

let roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.updateWorkState();

        if (creep.memory.work) {
            if (creep.memory.toRoom !== creep.room.name) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.toRoom));
            } else {

                creep.carrierWork(true);
            }
        } else {
            if (creep.memory.room !== creep.room.name) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
            } else {
                creep.withdrawFromSourceContainers();
            }
        }
	},

	create: function(room, spawn) {
	    let creepBody = [];
	    let avres = spawn.room.energyCapacityAvailable;
        let count = Math.min(avres/150>>0, 10);

        for (let i = count; i > 0; i--){
	        creepBody.push(CARRY);
	        creepBody.push(CARRY);
	        creepBody.push(MOVE);
        }

	    let newName = spawn.createCreep(
	        creepBody, undefined,
            {role: 'longCarrier', room: room.name, toRoom: spawn.room.name});
        if (_.isString(newName)) {
            console.log(`Spawning longCarrier ${newName} for ${room.name} 
                with ${count} coefficient at ${spawn}`);
        }
	},
};

module.exports = roleCarrier;