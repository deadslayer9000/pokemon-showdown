export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
simulate: {
    inherit: true,
    onHit(source, target) {
			let move: Move | ActiveMove | null = this.lastMove;
			if (!move) return;

			if (move.isMax && move.baseMove)
				move = this.dex.moves.get(move.baseMove);
			if (move.flags["failcopycat"] || move.isZ || move.isMax) {
				return false;
			}
            this.field.setTerrain("electricterrain", target)
			this.actions.useMove(move.id, target);
			this.add("-activate", target, "move: Simulate", move.name);
			//let success = false;
			const allies = [
				...target.side.pokemon,
				...(target.side.allySide?.pokemon || []),
			];
			for (const ally of allies) {
				if (ally !== source && !this.suppressingAbility(ally)) {
					if (ally.hasAbility("goodasgold")) {
						this.add("-immune", ally, "[from] ability: Good as Gold");
						continue;
					}
					if (ally.volatiles["substitute"] && !move.infiltrates) continue;
				}
				//if (
				ally.cureStatus();
				//) success = true;
			}
			//return success;
		},
    }, 
colddeparture: {
    inherit: true,
    flags: {
			protect: 1,
			reflectable: 1,
			mirror: 1,
			sound: 1,
			bypasssub: 1,
			metronome: 1,
		},
		onHit(target, source, move) {
			const success = this.boost(
				{ def: -1, spd: -1, spe: -1 },
				target,
				source
			);
			if (!success && !target.hasAbility("mirrorarmor")) {
				delete move.selfSwitch;
			}
		},
    },
icicleflail: {
    inherit: true,
		basePower: 60,
		pp: 5,
		onBasePower(relayVar, source, target, move) {
			let bp = move.basePower;
			let amountoftargets = 0;
			for (let targets of source.adjacentAllies()){
				amountoftargets += 1;
			}
			for (let targets of source.adjacentFoes()){
				amountoftargets += 1;
			}
			if (!amountoftargets){
				bp = 0;
			}else {
				bp = bp*amountoftargets;
				this.hint(`Icicle Flail hit with ${bp} BP because of its ${amountoftargets} targets!`)
				return bp;
			}
		},
        self: {},
		target: "allAdjacent",
	},
hauntedrequiem: {
    inherit: true,
    onTry() {},
},
primedcurrent: {
    inherit: true,
    basePower: 90,
    accuracy: 100,
    secondary: {
        chance: 20,
        status: 'par',
    },
},
planetdemolition: {
	num: -42,
		accuracy: 100,
		basePower: 120,
		category: "Physical",
		name: "Planet Demolition",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, bullet: 1 },
		self: {
			boosts: {
				atk: -1,
				def: -1,
			},
		},
		secondary: null,
		target: "normal",
		type: "Rock",
},
foamfrenzy: {
	inherit: true,
	basePower: 95,
	onAfterHit(target, pokemon, move) {
			if (!move.hasSheerForce) {
				const sideConditions = [
					"spikes",
					"toxicspikes",
					"stealthrock",
					"stickyweb",
					"gmaxsteelsurge",
				];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add(
							"-sideend",
							pokemon.side,
							this.dex.conditions.get(condition).name,
							"[from] move: Foam Frenzy",
							`[of] ${pokemon}`
						);
						pokemon.abilityState.foamfrenzy = true;
					}
				}
			}
			if (pokemon.abilityState.foamfrenzy) {
				pokemon.abilityState.foamfrenzy = false;
				this.boost({ spa: 1 }, pokemon, pokemon, move);
				this.hint(`Foam Frenzy boosted ${pokemon.name}'s Special Attack!`);
			}
		},
		onAfterSubDamage(damage, target, pokemon, move) {
			if (!move.hasSheerForce) {
				const sideConditions = [
					"spikes",
					"toxicspikes",
					"stealthrock",
					"stickyweb",
					"gmaxsteelsurge",
				];
				for (const condition of sideConditions) {
					if (pokemon.hp && pokemon.side.removeSideCondition(condition)) {
						this.add(
							"-sideend",
							pokemon.side,
							this.dex.conditions.get(condition).name,
							"[from] move: Foam Frenzy",
							`[of] ${pokemon}`
						);
						pokemon.abilityState.foamfrenzy = true;
					}
				}
			}
			if (pokemon.abilityState.foamfrenzy) {
				pokemon.abilityState.foamfrenzy = false;
				this.boost({ spa: 1 }, pokemon, pokemon, move);
				this.hint(`Foam Frenzy boosted ${pokemon.name}'s Special Attack!`);
			}
		},
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
		dragondrive: {
		inherit: true,
		type: "Electric",
	},
};