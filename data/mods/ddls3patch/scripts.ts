export const Scripts: ModdedBattleScriptsData = {
inherit: 'gen9',
    gen: 9,
    init() {
      this.modData("Learnsets", "venusaur").learnset.sludgewave = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.cottonguard = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.drainingkiss = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.dynamicpunch = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.machpunch = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.swordsdance = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.trailblaze = ["9M"];
    },
};