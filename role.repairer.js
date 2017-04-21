let utils = require('utils');

let roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.updateWorkState();

        if(creep.memory.work) {
            creep.repairerWork() || creep.builderWork() || creep.upgraderWork();
        } else {
            creep.withdrawFromContainers() || creep.harvestClosestSource();
        }
    },

    create: function(room, soft=false) {
        utils.createCreep('repairer', room, undefined, {softRepairer: soft});
    },

    expectedCount: function(room) {
        return room.find(FIND_STRUCTURES, {
            filter: structure => (structure.hits <= structure.hitsMax - 500)
            && structure.hitsMax > 300000}).length > 0 ? 1 : 0;
    }
};


module.exports = roleRepairer;