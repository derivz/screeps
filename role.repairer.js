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
        utils.createCreep('repairer', room, false, {softRepairer: soft});
    },

    expectedCount: function(room, builder=false) {
        if (builder && room.find(FIND_CONSTRUCTION_SITES).length > 0) return 1;
        return room.find(FIND_STRUCTURES, {
            filter: structure => (structure.hits <= structure.hitsMax/2)
            && structure.hitsMax > 300000 && structure.hits <= 750000}
        ).length > 0 ? 1 : 0;
    }
};


module.exports = roleRepairer;