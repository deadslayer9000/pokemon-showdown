export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	unchained: {
		onStart(pokemon) {
			this.boost({ spe: 1 }, pokemon);
		},
		flags: {},
		name: "Unchained",
		rating: 3,
		num: -113,
	},
	hypervirulent: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target) && !(source.types.includes("Poison") || source.types.includes("Steel"))) {
				if (this.randomChance(3, 10)) {
					source.addVolatile("viremic", target);
				}
			}
		},
		flags: {},
		name: "Hypervirulent",
		rating: 2,
		num: -112,
	},
};