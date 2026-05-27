export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	
	seasonalblessing: {
		num: -85,
		type: "Grass",
		accuracy: true,
		basePower: 0,
		category: "Status",
		name: "Seasonal Blessing",
		pp: 10,
		priority: 0,
		flags: { metronome: 1, protect: 1 },
		target: "self",
		sleepUsable: true,
		onModifyMove(move, pokemon, target) {	
			if ( pokemon.species.name === "Snorlax-Delta-Cherry"){
				move.target = "normal";
			}
		},

		onTry(source, target, move) {
			const form = source.species.name;
			if (source.status === "slp" && form !== "Snorlax-Delta-Autumn" && !source.sleepTalkUsed === true) {
				source.sleepTalkUsed = false;
				this.hint(
					"But it failed because its form isn't Snorlax-Delta-Autumn."
				);
				return;
			} else {
				source.sleepTalkUsed = false;
				if (form === "Snorlax-Delta-Winter") {
					const newtype = ["Ice", "Grass"];
					source.setType(newtype);
					this.add(
							"-start",
							source,
							"typechange",
							newtype.join("/"),
							"[from] move: Seasonal Blessing"
						);
					this.add(
						"-message",
						`${source.name}'s type changed to ${newtype.join(
							"/"
						)} due to its Seasonal Blessing!`
						);
					source.setAbility("Refrigerate");
					this.add("-ability", source, "Refrigerate");
					if (
						this.field.isWeather("hail") ||
						this.field.isWeather("snowscape")
					) {
						source.side.addSideCondition("auroraveil");
					}
				}
				if (form === "Snorlax-Delta-Summer") {
					const item = source.getItem();
					if (item.isBerry) {
						this.boost({ def: 1, spd: 1 }, source);
						source.eatItem();
					}
				}
				if (form === "Snorlax-Delta-Autumn") {
					if (source.status === "slp") {
						this.boost({ atk: 2, spa: 2 });
						this.hint(
							`${source.name}'s sleep increased the power of the boost!`
						);
					} else {
						this.boost({ atk: 1, spa: 1 });
					}
				}
				if (form === "Snorlax-Delta-Spring") {
					if (this.field.isTerrain("grassyterrain")) {
						move.heal = [1, 1];
						this.hint(
							`${source.name} used up Grassy Terrain to heal its pain!`
						);
						this.field.clearTerrain();
					} else {
						return false;
					}
				}
				if (form === "Snorlax-Delta-Cherry") {
					if (target.types.includes('Grass') || target.ability === 'sapsipper' || target.ability === 'goodasgold' || target.volatiles.substitute) { //hardcoded interaction
						return false;
					}
					const item = target.takeItem();
					if (item) {
						this.add(
							"-enditem",
							target,
							item.name,
							"[from] move: Seasonal Blessing",
							`[of] ${source}`
						);
					}
					target.addVolatile("leechseed", source);
				}
			}
		},
	},
	
	forecastwarning: {
		num: -123,
		accuracy: 100,
		basePower: 120,
		category: "Special",
		name: "Forecast Warning",
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		onTry(source, target, move) {
			if (!(this.field.isWeather("raindance") || this.field.isWeather("primordialsea"))) {

				if (!target.side.addSlotCondition(target, "futuremove")) return false;
				Object.assign(
					target.side.slotConditions[target.position]["futuremove"],
					{
						move: "forecastwarning",
						source,
						moveData: {
							id: "forecastwarning",
							name: "Forecast Warning",
							accuracy: 100,
							basePower: 120,
							category: "Special",
							priority: 0,
							flags: { allyanim: 1, metronome: 1, futuremove: 1 },
							ignoreImmunity: false,
							effectType: "Move",
							type: "Flying",
						},
					}
				);
				this.add("-start", source, "move: Forecast Warning");
				return this.NOT_FAIL;
			} else {
				this.hint(`The rain made Forecast Warning hit immediately!`);
			}
		},
		type: "Flying",
		target: "normal",
	},
};