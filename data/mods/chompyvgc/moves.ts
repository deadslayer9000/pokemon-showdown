export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	anchorshot: {
		inherit: true,
		basePower: 90,
	},
	appleacid: {
		inherit: true,
		basePower: 90,
	},
	astralbarrage: {
		inherit: true,
		basePower: 110,
	},
	attackorder: {
		inherit: true,
		
	},
	aurorabeam: {
		inherit: true,
		
	},
	banefulbunker: {
		inherit: true,
		pp: 5,
	},
	barbbarrage: {
		inherit: true,
		
	},
	beakblast: {
		inherit: true,
		basePower: 120,
		pp: 5,
	},
	behemothbash: {
		inherit: true,
		
	},
	behemothblade: {
		inherit: true,
		
	},
	blazingtorque: {
		inherit: true,
		
	},
	bleakwindstorm: {
		inherit: true,
		
	},
	bloodmoon: {
		inherit: true,
		basePower: 130,
		
	},
	blueflare: {
		inherit: true,
		
	},
	boltbeak: {
		inherit: true,
		basePower: 80,
	},
	boltstrike: {
		inherit: true,
		
	},
	bonerush: {
		inherit: true,
		basePower: 30,
	},
	branchpoke: {
		inherit: true,
		
	},
	brine: {
		inherit: true,
		
	},
	bubblebeam: {
		inherit: true,
		
	},
	burningbulwark: {
		inherit: true,
		
	},
	burnup: {
		inherit: true,
		isNonstandard: null,
	},
	celebrate: {
		inherit: true,
		
	},
	chloroblast: {
		inherit: true,
		
	},
	clangoroussoul: {
		inherit: true,
		accuracy: true,
	},
	collisioncourse: {
		inherit: true,
		
	},
	combattorque: {
		inherit: true,
		
	},
	confide: {
		inherit: true,
		
	},
	confusion: {
		inherit: true,
		
	},
	conversion: {
		inherit: true,
		
	},
	conversion2: {
		inherit: true,
		
	},
	corrosivegas: {
		inherit: true,
		isNonstandard: null,
	},
	courtchange: {
		inherit: true,
		
	},
	crabhammer: {
		inherit: true,
		accuracy: 95,
	},
	crushclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	crushgrip: {
		inherit: true,
		
	},
	cut: {
		inherit: true,
		
	},
	darkvoid: {
		inherit: true,
		
	},
	defendorder: {
		inherit: true,
		
	},
	defensecurl: {
		inherit: true,
		
	},
	diamondstorm: {
		inherit: true,
		
	},
	direclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
		secondary: {
			chance: 30,
			onHit(target, source) {
				const status = this.sample(['psn', 'par', 'slp']);
				target.trySetStatus(status, source);
			},
		},
		desc: "Has a 30% chance to cause the target to either fall asleep, become poisoned, or become paralyzed.",
		shortDesc: "30% chance to sleep, poison, or paralyze target.",
	},
	disarmingvoice: {
		inherit: true,
		
	},
	doodle: {
		inherit: true,
		
	},
	doomdesire: {
		inherit: true,
		
	},
	doublekick: {
		inherit: true,
		
	},
	doubleshock: {
		inherit: true,
	},
	dragonascent: {
		inherit: true,
	},
	dragonbreath: {
		inherit: true,
	},
	dragoncheer: {
		inherit: true,
		flags: { bypasssub: 1, allyanim: 1, metronome: 1, sound: 1 },
	},
	dragonclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	dragonenergy: {
		inherit: true,
		
	},
	dragonhammer: {
		inherit: true,
		basePower: 100,
		
	},
	dreameater: {
		inherit: true,
		
	},
	drumbeating: {
		inherit: true,
		
	},
	dynamaxcannon: {
		inherit: true,
		
	},
	echoedvoice: {
		inherit: true,
		
	},
	electrify: {
		inherit: true,
		isNonstandard: null,
	},
	electrodrift: {
		inherit: true,
		
	},
	ember: {
		inherit: true,
		
	},
	encore: {
		inherit: true,
	},
	esperwing: {
		inherit: true,
		
	},
	fairywind: {
		inherit: true,
		
	},
	falsesurrender: {
		inherit: true,
		
	},
	falseswipe: {
		inherit: true,
		
	},
	fierywrath: {
		inherit: true,
		
	},
	filletaway: {
		inherit: true,
		
	},
	firelash: {
		inherit: true,
		basePower: 90,
	},
	firepledge: {
		inherit: true,
		
	},
	firstimpression: {
		inherit: true,
		basePower: 100,
	},
	fishiousrend: {
		inherit: true,
		basePower: 80,
	},
	flamewheel: {
		inherit: true,
		
	},
	fleurcannon: {
		inherit: true,
		
	},
	floralhealing: {
		inherit: true,
		
	},
	forcepalm: {
		inherit: true,
		
	},
	freezeshock: {
		inherit: true,
		
	},
	freezingglare: {
		inherit: true,
		
	},
	furyattack: {
		inherit: true,
		
	},
	furycutter: {
		inherit: true,
		
	},
	furyswipes: {
		inherit: true,
		
	},
	fusionbolt: {
		inherit: true,
		
	},
	fusionflare: {
		inherit: true,
		
	},
	geargrind: {
		inherit: true,
		accuracy: 90,
		basePower: 60,
	},
	glaciallance: {
		inherit: true,
		
	},
	glaciate: {
		inherit: true,
		
	},
	glaiverush: {
		inherit: true,
		
	},
	grasspledge: {
		inherit: true,
		
	},
	gravapple: {
		inherit: true,
		basePower: 90,
	},
	growl: {
		inherit: true,
		
	},
	growth: {
		inherit: true,
		type: "Grass",
	},
	gust: {
		inherit: true,
		
	},
	happyhour: {
		inherit: true,
		
	},
	harden: {
		inherit: true,
		
	},
	headbutt: {
		inherit: true,
		
	},
	heartswap: {
		inherit: true,
		
	},
	holdback: {
		inherit: true,
		
	},
	holdhands: {
		inherit: true,
		
	},
	honeclaws: {
		inherit: true,
		
	},
	hornattack: {
		inherit: true,
		
	},
	hydrosteam: {
		inherit: true,
		
	},
	hyperdrill: {
		inherit: true,
		basePower: 120,
		
	},
	hyperspacefury: {
		inherit: true,
		
	},
	hyperspacehole: {
		inherit: true,
		
	},
	iceburn: {
		inherit: true,
		
	},
	incinerate: {
		inherit: true,
		
	},
	infernalparade: {
		inherit: true,
		basePower: 65,
	},
	ironhead: {
		inherit: true,
		secondary: {
			chance: 20,
			volatileStatus: 'flinch',
		},
		desc: "Has a 20% chance to make the target flinch.",
		shortDesc: "20% chance to make the target flinch.",
	},
	ivycudgel: {
		inherit: true,
		
	},
	jawlock: {
		inherit: true,
		
	},
	judgment: {
		inherit: true,
		
	},
	junglehealing: {
		inherit: true,
		
	},
	kingsshield: {
		inherit: true,
		isNonstandard: null,
		pp: 5,
	},
	leafage: {
		inherit: true,
		
	},
	leer: {
		inherit: true,
		
	},
	lick: {
		inherit: true,
		
	},
	lightofruin: {
		inherit: true,
		isNonstandard: null,
	},
	lunarblessing: {
		inherit: true,
		
	},
	lunardance: {
		inherit: true,
		
	},
	lusterpurge: {
		inherit: true,
		
	},
	magicalleaf: {
		inherit: true,
		
	},
	magicaltorque: {
		inherit: true,
		
	},
	magmastorm: {
		inherit: true,
		
	},
	makeitrain: {
		inherit: true,
		accuracy: 95,
		
	},
	malignantchain: {
		inherit: true,
		
	},
	megadrain: {
		inherit: true,
		
	},
	megapunch: {
		inherit: true,
		
	},
	metalclaw: {
		inherit: true,
		
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	metronome: {
		inherit: true,
		
	},
	mightycleave: {
		inherit: true,
		
	},
	mimic: {
		inherit: true,
		
	},
	mist: {
		inherit: true,
		
	},
	mistball: {
		inherit: true,
		
	},
	moonblast: {
		inherit: true,
		secondary: {
			chance: 10,
			boosts: {
				spa: -1,
			},
		},
		desc: "Has a 10% chance to lower the target's Special Attack by 1 stage.",
		shortDesc: "10% chance to lower the target's Sp. Atk by 1.",
	},
	moongeistbeam: {
		inherit: true,
		
	},
	mountaingale: {
		inherit: true,
		basePower: 120,
	},
	mysticalpower: {
		inherit: true,
		
	},
	nightdaze: {
		inherit: true,
		basePower: 90,
	},
	nightslash: {
		inherit: true,
		pp: 20,
	},
	nihillight: {
		inherit: true,
		pp: 5,
	},
	noretreat: {
		inherit: true,
		
	},
	noxioustorque: {
		inherit: true,
		
	},
	obstruct: {
		inherit: true,
		pp: 5,
	},
	orderup: {
		inherit: true,
		
	},
	originpulse: {
		inherit: true,
		
	},
	overdrive: {
		inherit: true,
		
	},
	payday: {
		inherit: true,
		
	},
	peck: {
		inherit: true,
		
	},
	photongeyser: {
		inherit: true,
		
	},
	playnice: {
		inherit: true,
		
	},
	poisongas: {
		inherit: true,
		
	},
	poisonsting: {
		inherit: true,
		
	},
	poisontail: {
		inherit: true,
		
	},
	powdersnow: {
		inherit: true,
		
	},
	powershift: {
		inherit: true,
		isNonstandard: null,
	},
	precipiceblades: {
		inherit: true,
		
	},
	present: {
		inherit: true,
		
	},
	prismaticlaser: {
		inherit: true,
		
	},
	protect: {
		inherit: true,
		pp: 5,
	},
	psybeam: {
		inherit: true,
		
	},
	psyblade: {
		inherit: true,
		
	},
	psychoboost: {
		inherit: true,
		
	},
	psyshieldbash: {
		inherit: true,
		basePower: 90,
	},
	psystrike: {
		inherit: true,
		
	},
	purify: {
		inherit: true,
		pp: 5,
	},
	pyroball: {
		inherit: true,
		
	},
	ragefist: {
		inherit: true,
		
	},
	// ragepowder: {
	// 	inherit: true,
	// 	flags: { noassist: 1, failcopycat: 1 },
	// },
	razorleaf: {
		inherit: true,
		
	},
	relicsong: {
		inherit: true,
		
	},
	retaliate: {
		inherit: true,
		
	},
	revelationdance: {
		inherit: true,
		basePower: 100,
		
	},
	revivalblessing: {
		inherit: true,
	},
	roaroftime: {
		inherit: true,
		
	},
	rocksmash: {
		inherit: true,
		
	},
	rockthrow: {
		inherit: true,
		
	},
	rollout: {
		inherit: true,
		
	},
	ruination: {
		inherit: true,
		
	},
	sacredfire: {
		inherit: true,
		
	},
	saltcure: {
		inherit: true,
		condition: {
			inherit: true,
			onResidual(pokemon) {
				this.damage(pokemon.baseMaxhp / (pokemon.hasType(['Water', 'Steel']) ? 8 : 16));
			},
		},
		desc: "Causes damage to the target equal to 1/16 of its maximum HP (1/8 if the target is Steel or Water type), rounded down, at the end of each turn during effect. This effect ends when the target is no longer active.",
		shortDesc: "Deals 1/16 max HP each turn; 1/8 on Steel, Water.",
	},
	sandattack: {
		inherit: true,
		
	},
	sandsearstorm: {
		inherit: true,
		
	},
	sandstorm: {
		inherit: true,
		pp: 5,
	},
	scratch: {
		inherit: true,
		
	},
	secretsword: {
		inherit: true,
		
	},
	seedflare: {
		inherit: true,
		
	},
	shadowclaw: {
		inherit: true,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
	},
	shadowforce: {
		inherit: true,
		
	},
	shelltrap: {
		inherit: true,
		pp: 10,
	},
	shiftgear: {
		inherit: true,
		
	},
	shockwave: {
		inherit: true,
		
	},
	shoreup: {
		inherit: true,
		
	},
	silktrap: {
		inherit: true,
		
	},
	sketch: {
		inherit: true,
		
	},
	slam: {
		inherit: true,
		
	},
	slash: {
		inherit: true,
		
	},
	sludge: {
		inherit: true,
		
	},
	smog: {
		inherit: true,
		
	},
	smokescreen: {
		inherit: true,
		
	},
	snaptrap: {
		inherit: true,
		isNonstandard: null,
		type: "Steel",
	},
	snipeshot: {
		inherit: true,
		basePower: 85,
		
	},
	snowscape: {
		inherit: true,
		pp: 5,
	},
	spacialrend: {
		inherit: true,
		
	},
	spark: {
		inherit: true,
		
	},
	spikyshield: {
		inherit: true,
		pp: 5,
	},
	spinout: {
		inherit: true,
		
		pp: 10,
	},
	spiritbreak: {
		inherit: true,
		
	},
	spiritshackle: {
		inherit: true,
		basePower: 90,
	},
	splash: {
		inherit: true,
		
	},
	springtidestorm: {
		inherit: true,
		
	},
	steameruption: {
		inherit: true,
		
	},
	stomp: {
		inherit: true,
		
	},
	stormthrow: {
		inherit: true,
		isNonstandard: null,
	},
	strangesteam: {
		inherit: true,
		
	},
	strength: {
		inherit: true,
		
	},
	sunsteelstrike: {
		inherit: true,
		
	},
	supersonic: {
		inherit: true,
		
	},
	surgingstrikes: {
		inherit: true,
		
	},
	swift: {
		inherit: true,
		
	},
	syrupbomb: {
		inherit: true,
		accuracy: 90,
	},
	tachyoncutter: {
		inherit: true,
		
	},
	tackle: {
		inherit: true,
		
	},
	tailglow: {
		inherit: true,
		
	},
	tailwhip: {
		inherit: true,
		
	},
	takedown: {
		inherit: true,
		
	},
	takeheart: {
		inherit: true,
		
	},
	tarshot: {
		inherit: true,
		
	},
	teleport: {
		inherit: true,
		
	},
	terablast: {
		inherit: true,
		
	},
	terastarstorm: {
		inherit: true,
		
	},
	thundercage: {
		inherit: true,
		
	},
	thunderclap: {
		inherit: true,
		
	},
	thunderouskick: {
		inherit: true,
		
	},
	thundershock: {
		inherit: true,
		
	},
	topsyturvy: {
		inherit: true,
		
	},
	toxicthread: {
		inherit: true,
		boosts: {
			spe: -2,
		},
		desc: "Lowers the target's Speed by 2 stages and poisons it.",
		shortDesc: "Lowers the target's Speed by 2 and poisons it.",
	},
	trickortreat: {
		inherit: true,
		isNonstandard: null,
	},
	tripledive: {
		inherit: true,
		basePower: 35,
		
	},
	triplekick: {
		inherit: true,
		
	},
	tropkick: {
		inherit: true,
		basePower: 85,
	},
	twister: {
		inherit: true,
		
	},
	vcreate: {
		inherit: true,
		
	},
	victorydance: {
		inherit: true,
		
	},
	vinewhip: {
		inherit: true,
		
	},
	visegrip: {
		inherit: true,
		
	},
	watergun: {
		inherit: true,
		
	},
	waterpledge: {
		inherit: true,
		
	},
	wickedblow: {
		inherit: true,
		
	},
	wickedtorque: {
		inherit: true,
		
	},
	wildboltstorm: {
		inherit: true,
		
	},
	wingattack: {
		inherit: true,
		
	},
	withdraw: {
		inherit: true,
		
	},
	workup: {
		inherit: true,
		
	},
	zingzap: {
		inherit: true,
		
	},
	seasonalblessing: {
	inherit: true,
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
	genesplice: {
		num: -120,
		accuracy: 95,
		basePower: 100,
		category: "Special",
		name: "Gene Splice",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, },
		onTryHit(target, source) {
			const targetAbility = target.getAbility();
			const sourceAbility = source.getAbility();
			if (
				sourceAbility.flags["failskillswap"] ||
				targetAbility.flags["failskillswap"] ||
				target.volatiles["dynamax"]
			) {
				return false;
			}
			const sourceCanBeSet = this.runEvent(
				"SetAbility",
				source,
				source,
				this.effect,
				targetAbility
			);
			if (!sourceCanBeSet) return sourceCanBeSet;
			const targetCanBeSet = this.runEvent(
				"SetAbility",
				target,
				source,
				this.effect,
				sourceAbility
			);
			if (!targetCanBeSet) return targetCanBeSet;
		},
		onHit(target, source, move) {
			const targetAbility = target.getAbility();
			const sourceAbility = source.getAbility();
			if (target.isAlly(source)) {
				this.add(
					"-activate",
					source,
					"move: Skill Swap",
					"",
					"",
					`[of] ${target}`
				);
			} else {
				this.add(
					"-activate",
					source,
					"move: Skill Swap",
					targetAbility,
					sourceAbility,
					`[of] ${target}`
				);
			}
			this.singleEvent("End", sourceAbility, source.abilityState, source);
			this.singleEvent("End", targetAbility, target.abilityState, target);
			source.ability = targetAbility.id;
			target.ability = sourceAbility.id;
			source.abilityState = this.initEffectState({
				id: this.toID(source.ability),
				target: source,
			});
			target.abilityState = this.initEffectState({
				id: this.toID(target.ability),
				target,
			});
			source.volatileStaleness = undefined;
			if (!target.isAlly(source)) target.volatileStaleness = "external";
			this.singleEvent("Start", targetAbility, source.abilityState, source);
			this.singleEvent("Start", sourceAbility, target.abilityState, target);
		},
		type: "Poison",
		target: "normal",
	},
	flashfist: {
		num: -105,
		accuracy: 100,
		basePower: 80,
		category: "Physical",
		name: "Flash Fist",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, contact: 1 },
		overrideOffensiveStat: 'spe',
		target: "normal",
		type: "Electric",
	},
	beamroulette: {
		num: -119,
		accuracy: 90,
		basePower: 80,
		category: "Special",
		name: "Beam Roulette",
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		basePowerCallback(pokemon, target, move) {
			let source = pokemon;
			let dice = this.random(5);
			let dice2 = this.random(5);
			this.hint(`Beam Roulette rolled a ${dice} and a ${dice2}!`);
			switch (dice) {
				case 0:
					move.basePower = move.basePower * 0.5;
					this.hint(`Beam Roulette's power was halved!`);
					break;
				case 1:
					move.basePower = move.basePower * 2;
					this.hint(`Beam Roulette's power was doubled!`);
					break;
				case 2:
					switch (dice2) {
						case 0:
							this.boost({ atk: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Attack!`);
							break;
						case 1:
							this.boost({ def: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Defense!`);
							break;
						case 2:
							this.boost({ spa: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Special Attack!`);
							break;
						case 3:
							this.boost({ spd: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Special Defense!`);
							break;
						case 4:
							this.boost({ spe: 1 }, target);
							this.hint(`Beam Roulette boosted the target's Speed!`);
							break;
					}
					break;
				case 3:
					switch (dice2) {
						case 0:
							this.boost({ atk: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Attack!`);
							break;
						case 1:
							this.boost({ def: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Defense!`);
							break;
						case 2:
							this.boost({ spa: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Special Attack!`);
							break;
						case 3:
							this.boost({ spd: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Special Defense!`);
							break;
						case 4:
							this.boost({ spe: 1 }, source);
							this.hint(`Beam Roulette boosted ${source.name}'s Speed!`);
							break;
					}
					break;
				case 4:
					move.selfSwitch = true;
					this.hint(`Beam Roulette caused ${source.name} to switch out!`);
					break;
			}
			return move.basePower;
		},
		target: "normal",
		type: "Ghost",
	},
	solarflare: {
		num: -100,
		accuracy: 100,
		basePower: 70,
		category: "Special",
		name: "Solar Flare",
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1 },
		willCrit: true,
		target: "normal",
		type: "Normal",
	},
};
