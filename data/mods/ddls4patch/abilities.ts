export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
paralysisphantom: {
	inherit: true,
	onAnyAfterSetStatus(status, target, source, effect) {
			if (
				source !== this.effectState.target ||
				target === source ||
				effect.effectType !== "Move"
			)
				return;
			if (status.id === "par") {
				target.addVolatile("embargo");
				this.add("-activate", source, "ability: Paralysis Phantom");
				}
			}
	},
fulltilt: {
	inherit: true,
	onModifySpe(spe, pokemon) {
		},
	onModifyAtk(atk, pokemon) {
			this.debug("Full Tilt Atk Boost");
			return this.chainModify(1.5);
		},	
},
planarcollapse: {
	inherit: true,
		onStart(source) {
			if (!source.planarCollapseOneTime) {
				this.add('-activate', source, 'ability: Planar Collapse'); //if anyone asks again planar collapse is 5 turns, 4 turns is misinformation from #custom-pokemon
				this.field.addPseudoWeather("gravity", source);
				source.planarCollapseOneTime = true;
			}
		},
		onEnd(target) {
			this.field.removePseudoWeather("gravity");
			this.add('-end', target, 'ability: Planar Collapse');
		},
	},
finalverdict: {
		onModifyDamage(damage, pokemon, target, move) {
			if (move.category === "Special" && move.type === "Psychic") {
				this.add("-activate", pokemon, "ability: Final Verdict");
				return this.chainModify(1.5);
			} else if (move.category === "Physical" && move.type === "Ghost") {
				this.add("-activate", pokemon, "ability: Final Verdict");
				return this.chainModify(1.5);
			}
		},
		onResidual(pokemon, source, effect) {
			const possibleTargets = pokemon.adjacentFoes();
			if (!possibleTargets.length) return;

			const target = this.sample(possibleTargets);
			if (target.hp < target.maxhp / 10) {
				target.faint();
				this.add("-ability", pokemon, "Final Verdict");
			}
		},

		flags: {},
		name: "Final Verdict",
		rating: 3,
		num: -6,
	},
};