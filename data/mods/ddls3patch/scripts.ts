export const Scripts: ModdedBattleScriptsData = {
inherit: 'gen9',
    gen: 9,
    init() {
      this.modData("Learnsets", "venusaur").sludgewave = ["9M"];
	  this.modData("Learnsets", "lopunny").cottonguard = ["9M"];
	  this.modData("Learnsets", "lopunny").drainingkiss = ["9M"];
	  this.modData("Learnsets", "lopunny").dynamicpunch = ["9M"];
	  this.modData("Learnsets", "lopunny").machpunch = ["9M"];
	  this.modData("Learnsets", "lopunny").swordsdance = ["9M"];
	  this.modData("Learnsets", "lopunny").trailblaze = ["9M"];
    },
};