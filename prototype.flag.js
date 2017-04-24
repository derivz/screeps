let mor = require('mine.other.room');

Flag.prototype.closestSpawn = function() {
    if (!this.memory.spawn) {
        let spawnName = _.sortByOrder(_.mapValues(Game.spawns, sp => {
            let cost = PathFinder.search(
                sp.pos, this.pos,
                {
                    plainCost: 1,
                    swampCost: 5,
                    roomCallback: mor.ignoreCreepsAndRoadsCostMatrix
                }
            ).cost;
            return {spawnName:sp.name, cost: cost};
        }), ['cost'])[0].spawnName;

        this.memory.spawn = spawnName;
    }
    return Game.spawns[this.memory.spawn];
};

Flag.prototype.isSourceFlag = function() {
    return this.color === COLOR_WHITE && this.secondaryColor === COLOR_WHITE;
};