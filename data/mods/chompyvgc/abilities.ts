export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	healer: {
		inherit: true,
		onResidual(pokemon) {
			for (const allyActive of pokemon.adjacentAllies()) {
				if (allyActive.status && this.randomChance(1, 2)) {
					this.add('-activate', pokemon, 'ability: Healer');
					allyActive.cureStatus();
				}
			}
		},
		desc: "50% chance this Pokemon's ally has its non-volatile status condition cured at the end of each turn.",
		shortDesc: "50% chance this Pokemon's ally has its status cured at the end of each turn.",
	},
	shedskin: {
		inherit: true,
		onResidual(pokemon) {
			if (pokemon.hp && pokemon.status && this.randomChance(3, 10)) {
				this.debug('shed skin');
				this.add('-activate', pokemon, 'ability: Shed Skin');
				pokemon.cureStatus();
			}
		},
		desc: "This Pokemon has a 30% chance to have its non-volatile status condition cured at the end of each turn.",
		shortDesc: "This Pokemon has a 30% chance to have its status cured at the end of each turn.",
	},
	unseenfist: {
		inherit: true,
		shortDesc: "This Pokemon's contact moves ignore a target's protection and deal 1/4 the usual damage.",
	},
	guardian: {
		onAllyHit(target, source, move) {
			if (target !== this.effectState.target && move.flags["contact"]) {
				this.boost({ def: 1 }, target, target, null, false, true);
				this.add("-activate", target, "ability: Guardian");
			}
		},
		flags: {},
		name: "Guardian",
		shortDesc: "When ally is hit by contact it raises their defense.",
	},
};
