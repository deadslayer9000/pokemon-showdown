export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	tidesigil: {
		inherit: true,
		onStart(pokemon) {
			if (pokemon.hp === pokemon.maxhp) {
				let activated = false;
				for (const target of pokemon.adjacentFoes()) {
					if (!activated) {
						this.add(
							"-activate",
							pokemon,
							"ability: Tide Sigil",
							"[from] ability: Tide Sigil",
							"[of] " + pokemon
						);
						activated = true;
						target.addVolatile("encore", pokemon);
					}
				}
			}
		},
	},
	grimsigil: {
		inherit: true,
		onStart(pokemon) {
			if (pokemon.hp === pokemon.maxhp) {
				let activated = false;
				for (const target of pokemon.adjacentFoes()) {
					if (!activated) {
						this.add(
							"-activate",
							pokemon,
							"ability: Grim Sigil",
							"[from] ability: Grim Sigil",
							"[of] " + pokemon
						);
						activated = true;
					}
					target.addVolatile("disable", pokemon);
				}
			}
		},
	},
	
	prospect: {
		inherit: true,
		onResidualOrder: 5,
		onResidualSubOrder: 3,
		onResidual(pokemon) {
			if (pokemon.hp && pokemon.status && this.randomChance(50, 100)) {
				this.debug("prospect");
				this.add("-activate", pokemon, "ability: Prospect");
				pokemon.cureStatus();
			}
		},
		onModifyAccuracyPriority: -1,
		onModifyAccuracy(accuracy, target) {
			if (typeof accuracy !== "number") return;
			this.debug("Prospect - Sure hit");
			return true;
		},
		onAfterMove() {},
	},
	minddive: {
		inherit: true,
		onStart(pokemon) {
			for (const target of pokemon.foes()) {
				for (const moveSlot of target.moveSlots) {
					const move = this.dex.moves.get(moveSlot.move);
					if (move.category === "Status") continue;
					const moveType =
						move.id === "hiddenpower" ? target.hpType : move.type;
					if (
						(this.dex.getImmunity(moveType, pokemon) &&
							this.dex.getEffectiveness(moveType, pokemon) > 0) ||
						move.ohko
					) {
						this.add("-ability", pokemon, "Anticipation");
						this.boost({spd: 1})
						return;
					}
				}
			}
		},
	},
	infernalwebs: {
		inherit: true,
		onTryMove(pokemon,source,move) {
			this.effectState.caught = false;
			let foes = pokemon.adjacentFoes();
			let foe;
			if (move.id === "stickyweb") {
				for (foe of foes){
					if (!foe.side.getSideCondition("Sticky Web")) {
				this.effectState.caught = true;
					}
				}
			}
		},
		onFoeTrapPokemon(pokemon) {
			let foes = pokemon.adjacentFoes();
			let foe;
			for (foe of foes){		
				if (
					pokemon.isGrounded() &&
					!pokemon.hasItem("heavydutyboots") &&
					!pokemon.hasAbility("Breach") &&
					pokemon.side.getSideCondition("Sticky Web") &&
					!pokemon.activeTurns &&
					!this.effectState.caught
				){
					pokemon.tryTrap(true);
					if (pokemon.tryTrap()) {
						pokemon.maybeTrapped = true;
					}
					pokemon.trySetStatus("brn", foe);
					this.effectState.caught = false;
				}
			}
		},
	},
	diamondgrove: {
		inherit: true,
		onDamage() {},
	},
	taproot: {
		inherit: true,
		onTryHealPriority: 1,
		onTryHeal(damage, target, source, effect) {
			const heals = [
				"drain",
				"leechseed",
				"ingrain",
				"aquaring",
				"strengthsap",
			];
			if (heals.includes(effect.id)) {
				return this.chainModify([5324, 4096]);
			}
		},
	}
};