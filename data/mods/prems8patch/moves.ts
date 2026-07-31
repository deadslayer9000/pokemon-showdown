export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	teslablitz: {
		num: -138,
		accuracy: 90,
		basePower: 95,
		category: "Special",
		name: "Tesla Blitz",
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		onBasePower(basePower, source, target, move) {
			if (target.runEffectiveness(move) > 0) {
				// Placeholder
				this.debug(`tesla blitz super effective buff`);
				return this.chainModify([4915, 4096]);
			}
		},
		target: "normal",
		type: "Electric",
	},
	rebirth: {
		num: -62,
		accuracy: 100,
		basePower: 195,
		category: "Special",
		name: "Rebirth",
		pp: 1,
		priority: 0,
		isZ: "ancientgeniumz",
		flags: { heal: 1, nosketch: 1 },
		onHit(target, source) {
			const move1name = source.moves[0];
			const move1type = this.dex.moves.get(move1name).type;
			const move2name = source.moves[1];
			const move2type = this.dex.moves.get(move2name).type;
			this.debug(move1type);
			this.debug(move2type);
			const newtype = [move1type, move2type];
			if (source.setType(newtype)) {
				this.add(
					"-start",
					source,
					"typechange",
					newtype.join("/"),
					"[from] move: Rebirth"
				);

				this.add(
					"-message",
					`${source.name} recreated itself into a ${newtype.join(
						"/"
					)} type!`
				);
			}
			let move = "revivalblessing";
			this.actions.useMove(move, source);
		},
		callsMove: true,
		target: "normal",
		type: "Psychic",
	},
	verdantflush: {
		num: -13,
		accuracy: 90,
		basePower: 75,
		category: "Physical",
		name: "Verdant Flush",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		secondary: {
			chance: 50,
			self: {
				boosts: {
					atk: 1,
				},
			},
		},
		target: "normal",
		type: "Fairy",
	},
	floridpuff: {
		num: -12,
		accuracy: 90,
		basePower: 75,
		category: "Special",
		name: "Florid Puff",
		pp: 5,
		priority: 0,
		flags: { metronome: 1, mirror: 1, protect: 1 },
		secondary: {
			chance: 50,
			self: {
				boosts: {
					spd: 1,
				},
			},
		},
		target: "normal",
		type: "Fairy",
	},
};