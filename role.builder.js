let utils = require('utils');

let roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.updateWorkState();

        if(creep.memory.work) {
            creep.builderWork() || creep.upgraderWork();
        } else {
            creep.withdrawFromContainers();
        }
    },

    create: function() {
        utils.createCreep('builder');
    }
};

module.exports = roleBuilder;