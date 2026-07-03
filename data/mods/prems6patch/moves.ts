export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	twincross: {
		inherit: true,
		secondary: {
					chance: 20,
					onHit(target, source) {
						const result = this.random(2);
						if (result === 0) {
							target.trySetStatus("brn", source);
						} else {
							target.trySetStatus("par", source);
						}
					},
				},
	},
	updraft: {
		inherit: true,
		basePower: 100,
	},
	roundhouseeclipse: {
		inherit: true,
		onAfterMoveSecondary() {},
		secondary: {
			self: {
				boosts: {
					atk: 1,
				},
			}
		},
	},
	ridethewave: {
		inherit: true,
		onHit(target) {
			if (target.getTypes().join() === "Water" || !target.setType("Water")) {
				// Soak should animate even when it fails.
				// Returning false would suppress the animation.
				this.add("-fail", target);
				return null;
			}
			this.add("-start", target, "typechange", "Water");
		},
		ignoreDefensive: false,
	},
	ampserum: {
		inherit: true,
		secondary: {
			chance: 100,
			volatileStatus: "taunt",
		},
	},
	annihilate: {
		inherit: true,
		basePower: 130,
	},
	aquaring: {
		inherit: true,
		condition: {
			duration: 255, //basically infinite
			durationCallback(target, source, effect) {
				if (effect?.name === 'Stream Shift') {
					return 255; //streamshift duration
				}
				return 255;
			},
			onStart(pokemon) {
				this.add("-start", pokemon, "Aqua Ring");
			},
			onResidualOrder: 6,
			onResidual(pokemon) {
				this.heal(pokemon.baseMaxhp / 16);
			},
			onEnd(pokemon) {
				this.add("-end", pokemon, "Aqua Ring");
			},
		},
	},
	gravity: {
		inherit: true,
		condition: {
			duration: 5,
			durationCallback(source, effect) {
				if (source?.hasAbility("persistent")) {
					this.add(
						"-activate",
						source,
						"ability: Persistent",
						"[move] Gravity"
					);
					return 7;
				}
				return 5;
			},
			onFieldStart(target, source) {
				if (source?.hasAbility("persistent")) {
					this.add("-fieldstart", "move: Gravity", "[persistent]");
				} else {
					this.add("-fieldstart", "move: Gravity");
				}
				for (const pokemon of this.getAllActive()) {
					let applies = false;
					if (
						pokemon.removeVolatile("bounce") ||
						pokemon.removeVolatile("fly")
					) {
						applies = true;
						this.queue.cancelMove(pokemon);
						pokemon.removeVolatile("twoturnmove");
					}
					if (pokemon.volatiles["skydrop"]) {
						applies = true;
						this.queue.cancelMove(pokemon);

						if (pokemon.volatiles["skydrop"].source) {
							this.add(
								"-end",
								pokemon.volatiles["twoturnmove"].source,
								"Sky Drop",
								"[interrupt]"
							);
						}
						pokemon.removeVolatile("skydrop");
						pokemon.removeVolatile("twoturnmove");
					}
					if (pokemon.volatiles["magnetrise"]) {
						applies = true;
						delete pokemon.volatiles["magnetrise"];
					}
					if (pokemon.volatiles["telekinesis"]) {
						applies = true;
						delete pokemon.volatiles["telekinesis"];
					}
					if (applies) this.add("-activate", pokemon, "move: Gravity");
				}
			},
			onModifyAccuracy(accuracy) {
				if (typeof accuracy !== "number") return;
				return this.chainModify([6840, 4096]);
			},
			onDisableMove(pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					if (this.dex.moves.get(moveSlot.id).flags["gravity"]) {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
			// groundedness implemented in battle.engine.js:BattlePokemon#isGrounded
			onBeforeMovePriority: 6,
			onBeforeMove(pokemon, target, move) {
				if (move.flags["gravity"] && !move.isZ) {
					this.add("cant", pokemon, "move: Gravity", move);
					return false;
				}
			},
			onModifyMove(move, pokemon, target) {
				if (move.flags["gravity"] && !move.isZ) {
					this.add("cant", pokemon, "move: Gravity", move);
					return false;
				}
			},
			onFieldResidualOrder: 27,
			onFieldResidualSubOrder: 2,
			onFieldEnd() {
				this.add("-fieldend", "move: Gravity");
			},
		},
	},
	collapsingclubpress: {
		inherit: true,
		basePower: 0,
		category: "Physical",
		damageCallback(pokemon, target) {
			const damage = pokemon.hp - target.maxhp;
			this.hint(`${damage}`);
			return damage;
		},
		onModifyMove(move, pokemon, target) {},
	},
	divineparry: {
		inherit: true,
		condition: {
			duration: 1,
			onStart(pokemon) {
				this.add("-singleturn", pokemon, "move: Divine Parry");
			},
			onHit(pokemon, source, move) {
				if (!pokemon.isAlly(source) && move.category != "Status") {
					this.effectState.gotHit = true;
					const action = this.queue.willMove(pokemon);
					if (action) {
						this.queue.prioritizeAction(action);
					}
				}
			},
			onAnyModifyDamage(damage, source, target, move){
				if (target.volatiles["divineparry"]) {
					return this.chainModify(0.5);
				}
			},
		},
		desc: "On use, this Pokemon enters a focus state. When in the focus state, all damage taken is reduced by 50%. If this Pokemon receives damage during the focus state, it will immediately use Divine Parry. If the Pokemon does not receive damage during the focus state, this attack executes at 3/4 power.",
		shortDesc: "50% DR; 3/4th power if not attacked."
	},
	steelskewer: {
		inherit: true,
		basePower: 70,
		accuracy: 90,
	},
	pulsarspiral: {
		inherit: true,
		basePower: 70,
	},
	wildwire: {
		inherit: true,
		basePower: 75,
	},
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