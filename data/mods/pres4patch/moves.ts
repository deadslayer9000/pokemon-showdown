export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	foamfrenzy: {
		inherit: true,
		basePower: 95,
	},
	dragondrive: {
		inherit: true,
		type: "Electric",
	},
	divination: {
		num: -54,
		accuracy: 100,
		basePower: 120,
		category: "Special",
		name: "Divination",
		pp: 10,
		priority: 0,
		flags: { allyanim: 1, metronome: 1, futuremove: 1 },
		ignoreImmunity: true,
		onTry(source, target) {
			if (!target.side.addSlotCondition(target, "futuremove")) return false;
			Object.assign(
				target.side.slotConditions[target.position]["futuremove"],
				{
					move: "divination",
					source,
					moveData: {
						id: "divination",
						name: "Divination",
						accuracy: 100,
						basePower: 120,
						category: "Special",
						priority: 0,
						flags: { allyanim: 1, metronome: 1, futuremove: 1 },
						ignoreImmunity: false,
						effectType: "Move",
						secondary: {
							chance: 30,
							boosts: {
								spd: -1,
							}
						},
						type: "Dark",
					},
				}
			);
			this.add("-start", source, "move: Divination");
			return this.NOT_FAIL;
		},
		secondary: null,
		target: "normal",
		type: "Dark",
	},
	sandbarrier: {
		num: -95,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Sand Barrier",
		pp: 10,
		priority: 4,
		flags: { noassist: 1, failcopycat: 1 },
		stallingMove: true,
		volatileStatus: "sandbarrier",
		onPrepareHit(pokemon) {
			return !!this.queue.willAct() && this.runEvent("StallMove", pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile("stall");
		},
		condition: {
			duration: 1,
			onStart(target) {
				this.add("-singleturn", target, "move: Protect");
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (!move.flags["protect"]) {
					if (["gmaxoneblow", "gmaxrapidflow"].includes(move.id)) return;
					if (move.isZ || move.isMax)
						target.getMoveHitData(move).zBrokeProtect = true;
					return;
				}
				if (move.smartTarget) {
					move.smartTarget = false;
				} else {
					this.add("-activate", target, "move: Protect");
				}
				const lockedmove = source.getVolatile("lockedmove");
				if (lockedmove) {
					// Outrage counter is reset
					if (source.volatiles["lockedmove"].duration === 2) {
						delete source.volatiles["lockedmove"];
					}
				}
				if (this.checkMoveMakesContact(move, source, target)) {
	
					const item = source.getItem();
					if (item) {
					this.add(
						"-enditem",
						source,
						item.name,
						"[from] move: Sand Barrier",
						`[of] ${target}`
					);
				}
				}
				return this.NOT_FAIL;
			},
		
		},
		secondary: null,
		target: "self",
		type: "Ground",
		zMove: { boost: { def: 1 } },
		contestType: "Tough",
	},
	
	cogniblast: {
		num: -101,
		accuracy: 100,
		basePower: 45,
		category: "Special",
		name: "Cogniblast",
		pp: 5,
		priority: 0,
		flags: { metronome: 1, protect: 1, mirror: 1},
		secondary: null,
		target: 'normal',
		type: "Psychic",
		
		basePowerCallback(pokemon, target, move) {
			let bp = move.basePower;
			if (this.field.pseudoWeather.echoedvoice) {
				bp =
					move.basePower +
					10 * this.field.pseudoWeather.echoedvoice.multiplier -
					45;
				this.hint(`Cogniblast hit with ${bp} BP`);
				return bp;
			}

			return bp;
		},
		
		onTry() {
			this.field.addPseudoWeather("echoedvoice");
		},
		condition: {		
			duration: 255, //was 2, 255 was an attempt to make it work on switchouts
			
			onFieldRestart() {
				if (this.effectState.duration !== 255) {
					this.effectState.duration = 255;
					if (this.effectState.multiplier < 8) {
						this.effectState.multiplier++;
					}
				}
			},
		},
		
		onHit(target, source, move) {
			let counter = this.field.pseudoWeather.echoedvoice.multiplier;
			if(counter > 1){
				source.deductPP(move.id, counter-1);
			}
		},

	},
	pressurize: {
		num: -81,
		accuracy: true,
		basePower: 0,
		category: "Status",
		pp: 5,
		priority: 0,
		name: "Pressurize",
		flags: { snatch: 1, heal: 1, metronome: 1 },
		secondary: null,
		target: "self",
		type: "Water",
		zMove: { effect: "clearnegativeboost" },
		onModifyMove(move, pokemon) {
			if (pokemon.status === "brn") {
				move.heal = [1, 2];
			} else {
				this.hint(
					`${pokemon.name}'s Pressurize failed because it isn't burned.`
				);
				return;
			}
		},
	},
	pollenpuff: {
		inherit: true,
		basePower: 80,
		pp: 10,
	},
	verdantflush: {
		inherit: true,
		basePower: 80,
		category: "Special",
		pp: 10,
	},
	depthdecree: {
		inherit: true,
		onTryMove(source, target, move) {
			if (
				["sunnyday", "desolateland"].includes(source.effectiveWeather())
			) {
				this.add("-activate", source, "Depth Decree");
				const bestStat = source.getBestStat(true, true);
				this.boost({ [bestStat]: 3 }, source);
				this.field.clearWeather();
			}
		},
	}
};