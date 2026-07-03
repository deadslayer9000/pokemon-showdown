export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	paragon: {
		onTryBoost(boost, target, source, effect) {
			if (source && target === source) return;
			let showMsg = false;
			let i: BoostID;
			for (i in boost) {
				if (boost[i]! < 0) {
					delete boost[i];
					showMsg = true;
				}
			}
			if (
				showMsg &&
				!(effect as ActiveMove).secondaries &&
				effect.id !== "octolock"
			) {
				this.add(
					"-fail",
					target,
					"unboost",
					"[from] ability: Paragon",
					`[of] ${target}`
				);
			}
		},
		flags: { breakable: 1 },
		name: "Paragon",
		rating: 2,
		num: -101,
	},
};