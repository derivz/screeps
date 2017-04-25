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
        return utils.createCreep('repairer', room, false, {softRepairer: soft});
    },

    expectedCount: function(room, builder=false, soft=false) {
        if (builder && room.find(FIND_CONSTRUCTION_SITES).length > 0) return 1;
        let startLimit = soft ? 0 : 300000;
        return room.find(FIND_STRUCTURES, {
            filter: structure => (structure.hits <= structure.hitsMax/2)
            && structure.hitsMax > startLimit && structure.hits <= 750000}
        ).length > 0 ? 1 : 0;
    }
};


module.exports = roleRepairer;