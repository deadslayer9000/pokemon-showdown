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
};