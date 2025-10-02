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
poisonheal: {
	inherit: true,
	onDamage(damage, target, source, effect) {
			if (
				(effect.id === "psn" || effect.id === "tox") &&
				this.field.isTerrain("corrosiveterrain")
			) {
				this.heal(target.baseMaxhp / 6);
				return false;
			} else if (effect.id === "psn" || effect.id === "tox") {
			if (effect.id === "psn" || effect.id === "tox") {
				this.heal(target.baseMaxhp / 8);
				return false;
			}
		}
	},
},
toxicboost: {
	inherit: true,
	onBasePower(basePower, attacker, defender, move) {
			if (
				(attacker.status === "psn" ||
					attacker.status === "tox") &&
				move.category === "Physical"
			) {
				return this.chainModify(1.5);
			}
		},
},
toxicchain: {
	inherit: true,
	onSourceDamagingHit(damage, target, source, move) {
			// Despite not being a secondary, Shield Dust / Covert Cloak block Toxic Chain's effect
			if (target.hasAbility("shielddust") || target.hasItem("covertcloak"))
				return;
			if (
				this.field.isTerrain("corrosiveterrain") &&
				this.randomChance(6, 10)
			) {
				target.trySetStatus("tox", source);
			} else if (this.randomChance(3, 10)) {
				target.trySetStatus("tox", source);
			}
		},
},
};