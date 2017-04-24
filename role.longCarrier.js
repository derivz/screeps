let con = require('constants');

let roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.updateWorkState();

        if (creep.memory.work) {
            if (this.memory.toRoom !== this.room.name) {
                this.moveTo(new RoomPosition(25, 25, this.memory.toRoom));
            } else {

                creep.carrierWork(true);
            }
        } else {
            if (this.memory.room !== this.room.name) {
                this.moveTo(new RoomPosition(25, 25, this.memory.room));
            } else {
                creep.withdrawFromSourceContainers();
            }
        }
	},

	create: function(room, spawn) {
	    let creepBody = [];
	    let avres = room.energyCapacityAvailable;
        let count = Math.min(avres/150>>0, 10);

        for (count; count > 0; count--){
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