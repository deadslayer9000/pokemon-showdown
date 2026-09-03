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
};