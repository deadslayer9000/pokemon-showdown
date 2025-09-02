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
		num: -70,
		accuracy: 90,
		basePower: 60,
		category: "Physical",
		name: "Icicle Flail",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, contact: 1 }, //TODO MAKE THIS NOT SHOW A HINT MSG FOR EACH TARGET
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
		secondary: null,
		target: "allAdjacent",
		type: "Ice",
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
};