export const Scripts: ModdedBattleScriptsData = {
inherit: 'gen9',
	gen: 9,
    init() {
	  //chapter 3 patch
	  this.modData("Learnsets", "grimmeon").learnset.calmmind = ["9M"];
	  this.modData("Learnsets", "uxieomega").learnset.stealthrock = ["9M"];
	  this.modData("Learnsets", "uxieomega").learnset.taunt = ["9M"];
	  this.modData("Learnsets", "staraptordelta").learnset.sacredfire = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.flamecharge = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.sunnyday = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.flamethrower = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.fireblast = ["9M"];
	  this.modData("Learnsets", "mespritomega").learnset.stealthrock = ["9M"];
	  delete this.modData("Learnsets", "shaykarp").learnset.chillingwater;
	},
};