export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	illusorysword: {
		inherit: true,
		onSwitchInPriority: -2,
		onStart(pokemon) {
			if (pokemon.hasAbility("Hocus Pocus") && !pokemon.illusionarysword) {
				pokemon.addVolatile("illusorysword");
				pokemon.illusionarysword = true;
			}
		},
		onModifyAtk(pokemon) {
			if (this.field.getPseudoWeather("trickroom")) {
				return this.chainModify([5324, 4096]);
			}
		},
		onModifyDef(pokemon) {
			if (this.field.getPseudoWeather("trickroom")) {
				return this.chainModify([5324, 4096]);
			}
		},
		condition: {
			onStart(pokemon) {
				this.add(
					"-activate",
					pokemon,
					"ability: Hocus Pocus",
					"[consumed]"
				);
				this.field.addPseudoWeather("trickroom");
			},
		},
	},
};