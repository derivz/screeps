let roleClaimer = {
    /** @param {Creep} creep **/
    run: function(creep) {
        let controller = creep.room.controller;
        if (creep.reserveController(controller) == ERR_NOT_IN_RANGE) {
            creep.move(controller);
        }
	},

	create: function(flag) {
        let spawn = flag.closestSpawn();
	    let creepBody = [MOVE, MOVE, CLAIM, CLAIM];
	    let newName = spawn.createCreep(
	        creepBody, undefined, {role: 'claimer', room: flag.pos.roomName});
        if (_.isString(newName)) {
            console.log(`Spawning new claimer: ${newName} 
                for room ${flag.pos.roomName} at ${spawn.name}`);
        }
	},
};

module.exports = roleClaimer;