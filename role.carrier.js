let con = require('constants');

let roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.updateWorkState();

        if (!creep.handleDroppedResources()) {
            if (creep.memory.work) {
                creep.carrierWork();
            } else {
                creep.withdrawFromSourceContainers();
            }
        }
	},

	create: function(room=con.room, budget=false) {
        let spawns = _.filter(
            Game.spawns, sp => sp.room == room && !sp.spawning);
        if (spawns.length <= 0) return false;
        let spawn = spawns[0];
	    let creepBody = [];
	    let avres = budget ? room.energyAvailable : room.energyCapacityAvailable;
        let count = Math.min(avres/150>>0, 4);
        console.log(room.name, count)

        for (count; count > 0; count--){
	        creepBody.push(CARRY);
	        creepBody.push(CARRY);
	        creepBody.push(MOVE);
        }

	    let newName = spawn.createCreep(
	        creepBody, undefined, {role: 'carrier', room: room.name});
        if (_.isString(newName)) {
            console.log(`Spawning new ${budget?'budget ':' '}
                carrier: ${newName} at ${room.name}`);
        }
	},
};

module.exports = roleCarrier;