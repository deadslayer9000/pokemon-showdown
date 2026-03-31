export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	diamondgrove: {
		inherit: true,
		onDamage(damage, target, source, effect) {
			if (this.field.isTerrain("grassyterrain")){
			if (effect && effect.id === 'stealthrock' || effect.id === 'gmaxsteelsurge' || effect.id === 'spikes') {
				return false;
			}
		}
		},
	},
	planarcollapse: {
		inherit: true,
		onStart(source) {
			this.add('-activate', source, 'ability: Planar Collapse'); //if anyone asks again planar collapse is 5 turns, 4 turns is misinformation from #custom-pokemon
			this.field.addPseudoWeather("gravity", source);
		},
		onEnd(target) {},
	},
	
};