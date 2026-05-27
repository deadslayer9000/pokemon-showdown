export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
moonwake: {
	inherit: true,
	onStart(pokemon) {
			this.add("-ability", pokemon, "Moonwake");
		},
		onModifyMove(move) {
			move.ignoreAbility = true;
		},
		onModifySpDPriority: 6,
		onModifySpD(spd, pokemon) {
			for (const ally of pokemon.adjacentAllies()) {
				if (ally.hasAbility("Dawnbreak")) {
					this.add("-ability", pokemon, "Moonwake", "boost");
					return this.chainModify(1.5);
				}
			}
		},
		flags: {},
	desc: "This Pokemon ignores abilities with its moves. This Pokemon gets a 1.5x Special Defense boost if a Pokemon with Dawnbreak is active on this side.",
	shortDesc: "Moves ignore abilities; 1.5x SpD if a Pokemon with Dawnbreak is active.",
},
prospect: {
		onAfterMove(source, target, move) {
			if (move.flags['futuremove']) {
				source.prospect = true;
				//this.boost({ spd: 1 }, source);
			}
		},
		onResidual(target, source, effect) {
			const possibleTargets = target.adjacentFoes();
			if (!possibleTargets.length) return;

			const foe = this.sample(possibleTargets);
			if (!foe.side.slotConditions[foe.position]["futuremove"] && target.prospect) {
				target.prospect = false;
				this.boost({ spd: 1 }, target);
			}
		},
		flags: {},
		name: "Prospect",
		rating: 2,
		num: -52,
	},
};