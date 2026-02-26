export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	steamforged: {
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target)) {
				if (this.randomChance(3, 10)) {
					source.trySetStatus("brn", target);
				}
			}
		},
		/*
		onSourceModifyDamage(relayVar, source, target, move) {
			if (target !== source && move.type === "Water") {
				this.add("-activate", target, "ability: Steamforged");
				return this.chainModify(0.5);
			}
		},
		*/
		flags: { breakable: 1 },
		name: "Steamforged",
		rating: 2,
		num: -71,
	},
	hocuspocus: {	
		onFractionalPriorityPriority: -1,
		onFractionalPriority(priority, pokemon, target, move) {
			if (
				this.field.getPseudoWeather("trickroom") &&
				move.category === "Status"
			) {
				return -9;
			}
		},
		flags: {},
		name: "Hocus Pocus",
		rating: 5,
		num: -47,
	},
	pyroclastic: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			if (boost.accuracy && boost.accuracy < 0) {
				delete boost.accuracy;
				if (!(effect as ActiveMove).secondaries) {
					this.add(
						"-fail",
						target,
						"unboost",
						"accuracy",
						"[from] ability: Keen Eye",
						`[of] ${target}`
					);
				}
			}
		},
		onSwitchOut(pokemon) {
			pokemon.heal(pokemon.baseMaxhp / 3);
		},
		flags: {},
		name: "Pyroclastic",
		rating: 3.5,
		num: -5,
	},
	necromancy: {
		onStart(pokemon) {
			const fallen = Math.min(
				pokemon.side.foe.pokemon.filter((p) => p.fainted).length,
				5
			);
			if (fallen > 0) {
				this.add("-start", pokemon, `fallen${fallen}`, "[silent]");
				this.effectState.fallen = fallen;
			}
		},
		onEnd(pokemon) {
			if (this.effectState.fallen) {
				this.add(
					"-end",
					pokemon,
					`fallen${this.effectState.fallen}`,
					"[silent]"
				);
			}
		},
		onResidual(pokemon) {
			const fallen = Math.min(
				pokemon.side.foe.pokemon.filter((p) => p.fainted).length,
				5
			);
			if (fallen > 0) {
				this.add(
					"-end",
					pokemon,
					`fallen${this.effectState.fallen}`,
					"[silent]"
				);
				this.add("-start", pokemon, `fallen${fallen}`, "[silent]");
				this.add("-activate", pokemon, "ability: Necromancy");
				this.effectState.fallen = fallen;
			}
		},
		onBasePowerPriority: 21,
		onBasePower(basePower, attacker, defender, move) {
			if (this.effectState.fallen) {
				const powMod = [4096, 4506, 4915, 5325, 5734, 6144];
				this.debug(
					`Supreme Overlord boost: ${powMod[this.effectState.fallen]}/4096`
				);
				return this.chainModify([powMod[this.effectState.fallen], 4096]);
			}
		},
		onBeforeMove(source, target, move) {
			if (move.category === "Physical"){
				move.overrideOffensiveStat = 'spa';
			}
		},
		flags: {},
		name: "Necromancy",
		rating: 4,
		num: -94,
	},
	ragnarok: {
		onModifyMovePriority: -1,
		onModifyMove(move) {
			if (
				move.multihit &&
				Array.isArray(move.multihit) &&
				move.multihit.length
			) {
				move.multihit = [3, 5];
			}
			if (move.multiaccuracy) {
				delete move.multiaccuracy;
			}
			if (move.category === "Physical") {
				if (!move.secondaries) move.secondaries = [];
				for (const secondary of move.secondaries) {
					if (secondary.status === "brn") return;
				}
				move.secondaries.push({
					chance: 10,
					status: "brn",
				});
			}
		},
		flags: {},
		name: "Ragnarok",
		rating: 3,
		num: -46,
	},
	resolute: {
		onTryHit(target, source, move) {
			if (target !== source && move.priority > 0) {
				if (!this.heal(target.baseMaxhp / 4)) {
					this.add("-immune", target, "[from] ability: Resolute");
				}
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Resolute",
		rating: 3,
		num: -98
	},
};