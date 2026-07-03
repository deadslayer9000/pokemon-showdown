export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	genesplice: {
		num: -120,
		accuracy: 95,
		basePower: 100,
		category: "Special",
		name: "Gene Splice",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, },
		onTryHit(target, source) {
			const targetAbility = target.getAbility();
			const sourceAbility = source.getAbility();
			if (
				sourceAbility.flags["failskillswap"] ||
				targetAbility.flags["failskillswap"] ||
				target.volatiles["dynamax"]
			) {
				return false;
			}
			const sourceCanBeSet = this.runEvent(
				"SetAbility",
				source,
				source,
				this.effect,
				targetAbility
			);
			if (!sourceCanBeSet) return sourceCanBeSet;
			const targetCanBeSet = this.runEvent(
				"SetAbility",
				target,
				source,
				this.effect,
				sourceAbility
			);
			if (!targetCanBeSet) return targetCanBeSet;
		},
		onHit(target, source, move) {
			const targetAbility = target.getAbility();
			const sourceAbility = source.getAbility();
			if (target.isAlly(source)) {
				this.add(
					"-activate",
					source,
					"move: Skill Swap",
					"",
					"",
					`[of] ${target}`
				);
			} else {
				this.add(
					"-activate",
					source,
					"move: Skill Swap",
					targetAbility,
					sourceAbility,
					`[of] ${target}`
				);
			}
			this.singleEvent("End", sourceAbility, source.abilityState, source);
			this.singleEvent("End", targetAbility, target.abilityState, target);
			source.ability = targetAbility.id;
			target.ability = sourceAbility.id;
			source.abilityState = this.initEffectState({
				id: this.toID(source.ability),
				target: source,
			});
			target.abilityState = this.initEffectState({
				id: this.toID(target.ability),
				target,
			});
			source.volatileStaleness = undefined;
			if (!target.isAlly(source)) target.volatileStaleness = "external";
			this.singleEvent("Start", targetAbility, source.abilityState, source);
			this.singleEvent("Start", sourceAbility, target.abilityState, target);
		},
		type: "Poison",
		target: "normal",
	},
	flashfist: {
		num: -105,
		accuracy: 100,
		basePower: 80,
		category: "Physical",
		name: "Flash Fist",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, contact: 1 },
		overrideOffensiveStat: 'spe',
		target: "normal",
		type: "Electric",
	},
	beamroulette: {
		num: -119,
		accuracy: 90,
		basePower: 80,
		category: "Special",
		name: "Beam Roulette",
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		basePowerCallback(pokemon, target, move) {
			let source = pokemon;
			let dice = this.random(5);
			let dice2 = this.random(5);
			this.hint(`Beam Roulette rolled a ${dice} and a ${dice2}!`);
			switch (dice) {
				case 0:
					move.basePower = move.basePower * 0.5;
					this.hint(`Beam Roulette's power was halved!`);
					break;
				case 1:
					move.basePower = move.basePower * 2;
					this.hint(`Beam Roulette's power was doubled!`);
					break;
				case 2:
					switch (dice2) {
						case 0:
							this.boost({ atk: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Attack!`);
							break;
						case 1:
							this.boost({ def: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Defense!`);
							break;
						case 2:
							this.boost({ spa: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Special Attack!`);
							break;
						case 3:
							this.boost({ spd: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Special Defense!`);
							break;
						case 4:
							this.boost({ spe: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Speed!`);
							break;
					}
					break;
				case 3:
					switch (dice2) {
						case 0:
							this.boost({ atk: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Attack!`);
							break;
						case 1:
							this.boost({ def: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Defense!`);
							break;
						case 2:
							this.boost({ spa: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Special Attack!`);
							break;
						case 3:
							this.boost({ spd: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Special Defense!`);
							break;
						case 4:
							this.boost({ spe: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Speed!`);
							break;
					}
					break;
				case 4:
					move.selfSwitch = true;
					this.hint(`Beam Roulette caused ${source.name} to switch out!`);
					break;
			}
			return move.basePower;
		},
		target: "normal",
		type: "Ghost",
	},
	solarflare: {
		num: -100,
		accuracy: 100,
		basePower: 70,
		category: "Special",
		name: "Solar Flare",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1 },
		willCrit: true,
		target: "normal",
		type: "Normal",
	},
};