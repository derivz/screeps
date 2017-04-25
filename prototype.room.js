let con = require('constants');
let roleBuilder = require('role.builder');
let roleContainerHarvester = require('role.containerHavester');
let roleCarrier = require('role.carrier');
let roleRepairer = require('role.repairer');
let roleUpgrader = require('role.upgrader');
let tower = require('tower');
let utils = require('utils');

Room.prototype.handleCreeps = function() {
    if (!this.controller || !this.controller.my) {
        return false;
    }
    tower.towerLogic(this);

    let creepCounts = _.mapValues(
        _.groupBy(_.filter(
            Game.creeps,
            x=>(x.memory.room === this.name) || (!x.memory.room && this === con.room)
        ), 'memory.role'),
        (v) => v.length
    );

    let harvestersCount = creepCounts.harvester || 0;
    let upgradersCount = creepCounts.upgrader || 0;
    let buildersCount = creepCounts.builder || 0;
    let carriersCount = creepCounts.carrier || 0;
    let repairersCount = creepCounts.repairer || 0;

    // creeps creating

    if (roleContainerHarvester.isContainerHarvesterAvailable(this)) {
        if (roleContainerHarvester.create(this)) return true;
    } else {
        if(harvestersCount === 0) {
            utils.createCreep('harvester', this, true);
            return true;
        } else if(harvestersCount < 2) {
            utils.createCreep('harvester', this);
        }
    }

    let carryGoodCount = 2;
    let oldCarrier = _.filter(
        Game.creeps,
        c => c.isCarrier() && c.memory.room === this.name && c.ticksToLive < 30);
    if(carriersCount < carryGoodCount + 1 && oldCarrier.length > 0
            || carriersCount < carryGoodCount) {
        roleCarrier.create(this);
    } else if(carriersCount < 1) {
        roleCarrier.create(this, true);
        return true;
    }



    console.log(`${upgradersCount} upgraders, `,
        `${buildersCount} builders at room ${this.name}`);
    if(upgradersCount < 1) {
        roleUpgrader.create(this);
    }else if(buildersCount < 2) {
        console.log(`should create builder at ${this.name}`);
        roleBuilder.create(this);
    }else if(repairersCount < roleRepairer.expectedCount(this)) {
        console.log(`should create repairer at ${this.name}`);
        roleRepairer.create(this);
    }

};
