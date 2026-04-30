export const Scripts: ModdedBattleScriptsData = {
inherit: 'gen9',
    gen: 9,
	pokemon: { //""hardcode"" designed specifically for moonwake because neutralizing gas is hardcoded, e.g. moonwake is now hardcoded e.g. I gotta paste this in to disable that + dawnbreak's immunity to it
		inherit: true,
		ignoringAbility() {
		if (this.battle.gen >= 5 && !this.isActive) return true;

		// Certain Abilities won't activate while Transformed, even if they ordinarily couldn't be suppressed (e.g. Disguise)
		if (this.getAbility().flags['notransform'] && this.transformed) return true;
		if (this.getAbility().flags['cantsuppress']) return false;
		if (this.volatiles['gastroacid']) return true;

		// Check if any active pokemon have the ability Neutralizing Gas
		if (this.hasItem('Ability Shield') || this.ability === ('neutralizinggas' as ID)) return false;
		for (const pokemon of this.battle.getAllActive()) {
			// can't use hasAbility because it would lead to infinite recursion
			if (pokemon.ability === ('neutralizinggas' as ID) && !pokemon.volatiles['gastroacid'] &&
				!pokemon.transformed && !pokemon.abilityState.ending && !this.volatiles['commanding']) {
				return true;
			}
		}

		return false;
	}
}
};