export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
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
			if (pokemon.status === "brn" || pokemon.status === "") {
				pokemon.trySetStatus("brn", pokemon);
				move.heal = [1, 2];
			} else {
				this.hint(
					`${pokemon.name}'s Pressurize failed because this Pokemon is not healthy or burned.`
				);
				return;
			}
		},
	},
	blazeout: {
		num: -3,
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Blaze Out",
		pp: 10,
		priority: 0,
		flags: {},
		priorityChargeCallback(source) {
			source.addVolatile("chillyreception");
		},
		weather: "sunnyday",
		selfSwitch: true,
		secondary: null,
		condition: {
			duration: 1,
			onBeforeMovePriority: 100,
			onBeforeMove(source, target, move) {
				if (move.id !== "chillyreception") return;
				this.add("-prepare", source, "Chilly Reception", "[premajor]");
			},
		},
		target: "all",
		type: "Fire",
	},
	tomahawkvolley: {
		inherit: true,
		accuracy: 85,
		basePower: 25,
	},
	shockingblow: {
		inherit: true,
		basePower: 85,
	},
	ridethewave: {
		inherit: true,
		basePower: 195,
	},
	depthdecree: {
		inherit: true,
		basePower: 75,
	},
	vascend: {
		inherit: true,
		basePower: 150,
		accuracy: 100,
	},
	rebirth: {
		inherit: true,
		basePower: 185,
	},
};