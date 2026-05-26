export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	spectreonslaught: {//I HAVE NO IDEA WHERE THE DAMAGE MULTIPLIER FOR THE MULTIHIT IS PLEASE HELPPPPPPP 
		onPrepareHit(source, target, move) {
			if (
				move.name === "Night Shade" ||
				move.category === "Status" ||
				move.multihit ||
				move.flags["noparentalbond"] ||
				move.flags["charge"] ||
				move.flags["futuremove"] ||
				move.spreadHit ||
				move.isZ ||
				move.isMax
			)
				return;
			move.multihit = 4;
			move.multihitType = "spectreonslaught";
		},
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === "spectreonslaught" && move.hit > 1) {
				return [];
			}
		},

		flags: {},
		name: "Spectre Onslaught",
		rating: 3,
		num: -39,
	},
};