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
			this.actions.useMove(move.id, target);
			this.add("-activate", target, "move: Simulate", move.name);
			this.field.setTerrain("electricterrain", target);
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
				{ def: -3, spd: -1, spe: -1 },
				target,
				source
			);
			if (!success && !target.hasAbility("mirrorarmor")) {
				delete move.selfSwitch;
			}
		},
    },

};