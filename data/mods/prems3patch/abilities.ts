export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
guardian: {
    inherit: true,
    onAllyHit() {},
    onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) {
				this.add("-immune", target, "[from] ability: Guarded");
			}
			return false;
		},
	onTryAddVolatile(status, target) {
			if (status.id === "yawn") {
				this.add("-immune", target, "[from] ability: Guarded");
				return null;
			}
			if (status.id === "flinch") return null;
		},
    flags: {breakable: 1},
},
steamforged: {
    inherit: true,
    onSourceModifyDamage() {},
    flags: {},
},
};