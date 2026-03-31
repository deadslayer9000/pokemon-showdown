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
	collapsingclubpress: {
		inherit: true,
		damageCallback(pokemon, target) {
			const damage = pokemon.hp - target.maxhp;
			this.hint(`${damage}`);
			return damage;
		},
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
	}
};