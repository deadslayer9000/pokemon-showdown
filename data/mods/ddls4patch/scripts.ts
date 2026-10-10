export const Scripts: ModdedBattleScriptsData = {
inherit: 'gen9',
	gen: 9,
	pokemon: {
		getMoves(lockedMove?: ID | null, restrictData?: boolean): MoveRequestData[] {
				if (lockedMove) {
					lockedMove = this.battle.dex.toID(lockedMove);
					if (lockedMove === 'recharge') {
						return [{
							move: 'Recharge',
							id: 'recharge' as ID,
						}];
					}
					for (const moveSlot of this.moveSlots) {
						if (moveSlot.id !== lockedMove) continue;
						return [{
							move: moveSlot.move,
							id: moveSlot.id,
						}];
					}
					// does this happen?
					return [{
						move: this.battle.dex.moves.get(lockedMove).name,
						id: lockedMove,
					}];
				}
				const moves = [];
				let hasValidMove = false;
				for (const moveSlot of this.moveSlots) {
					let moveName = moveSlot.move;
					if (moveSlot.id === 'hiddenpower') {
						moveName = `Hidden Power ${this.hpType}`;
						if (this.battle.gen < 6) moveName += ` ${this.hpPower}`;
					} else if (moveSlot.id === 'return' || moveSlot.id === 'frustration') {
						const basePowerCallback = this.battle.dex.moves.get(moveSlot.id).basePowerCallback as (pokemon: Pokemon) => number;
						moveName += ` ${basePowerCallback(this)}`;
					}
					let target = moveSlot.target;
					switch (moveSlot.id) {
					case 'curse':
						if (!this.hasType('Ghost')) {
							target = this.battle.dex.moves.get('curse').nonGhostTarget;
						}
						break;
					case 'pollenpuff':
						// Heal Block only prevents Pollen Puff from targeting an ally when the user has Heal Block
						if (this.volatiles['healblock']) {
							target = 'adjacentFoe';
						}
						break;
					case 'terastarstorm':
						if (this.species.name === 'Terapagos-Stellar') {
							target = 'allAdjacentFoes';
						}
						break;
					}
					let disabled = moveSlot.disabled;
					if (this.volatiles['dynamax']) {
						// if each of a Pokemon's base moves are disabled by one of these effects, it will Struggle
						const canCauseStruggle = ['Encore', 'Disable', 'Taunt', 'Assault Vest', 'Belch', 'Stuff Cheeks'];
						disabled = this.maxMoveDisabled(moveSlot.id) || disabled && canCauseStruggle.includes(moveSlot.disabledSource!);
					} else if (moveSlot.pp <= 0) {
						disabled = true;
					}
		
					if (disabled === 'hidden') {
						disabled = !restrictData;
					}
					if (!disabled) {
						hasValidMove = true;
					}
		
					moves.push({
						move: moveName,
						id: moveSlot.id,
						pp: moveSlot.pp,
						maxpp: moveSlot.maxpp,
						target,
						disabled,
					});
				}
				return hasValidMove ? moves : [];
			}
	},
	actions: {
		spreadMoveHit(
		targets: SpreadMoveTargets, pokemon: Pokemon, moveOrMoveName: ActiveMove,
		hitEffect?: Dex.HitEffect, isSecondary?: boolean, isSelf?: boolean
	): [SpreadMoveDamage, SpreadMoveTargets] {
		// Hardcoded for single-target purposes
		// (no spread moves have any kind of onTryHit handler)
		const target = targets[0];
		let damage: (number | boolean | undefined)[] = [];
		for (const i of targets.keys()) {
			damage[i] = true;
		}
		const move = this.dex.getActiveMove(moveOrMoveName);
		let hitResult: boolean | number | null = true;
		let moveData = hitEffect as ActiveMove;
		if (!moveData) moveData = move;
		if (!moveData.flags) moveData.flags = {};
		if (move.target === 'all' && !isSelf) {
			hitResult = this.battle.singleEvent('TryHitField', moveData, {}, target || null, pokemon, move);
		} else if ((move.target === 'foeSide' || move.target === 'allySide' || move.target === 'allyTeam') && !isSelf) {
			hitResult = this.battle.singleEvent('TryHitSide', moveData, {}, target || null, pokemon, move);
		} else if (target) {
			hitResult = this.battle.singleEvent('TryHit', moveData, {}, target, pokemon, move);
		}
		if (!hitResult) {
			if (hitResult === false) {
				this.battle.add('-fail', pokemon);
				this.battle.attrLastMove('[still]');
			}
			return [[false], targets]; // single-target only
		}

		// 0. check for substitute
		if (!isSecondary && !isSelf) {
			if (move.target !== 'all' && move.target !== 'allyTeam' && move.target !== 'allySide' && move.target !== 'foeSide') {
				damage = this.tryPrimaryHitEvent(damage, targets, pokemon, move, moveData, isSecondary);
			}
		}

		for (const i of targets.keys()) {
			if (damage[i] === this.battle.HIT_SUBSTITUTE) {
				damage[i] = true;
				targets[i] = null;
			}
			if (targets[i] && isSecondary && !moveData.self) {
				damage[i] = true;
			}
			if (!damage[i]) targets[i] = false;
		}
		// 1. call to this.battle.getDamage
		damage = this.getSpreadDamage(damage, targets, pokemon, move, moveData, isSecondary, isSelf);

		for (const i of targets.keys()) {
			if (damage[i] === false) targets[i] = false;
		}

		// 2. call to this.battle.spreadDamage
		damage = this.battle.spreadDamage(damage, targets, pokemon, move);

		for (const i of targets.keys()) {
			if (damage[i] === false) targets[i] = false;
		}

		// 3. onHit event happens here
		damage = this.runMoveEffects(damage, targets, pokemon, move, moveData, isSecondary, isSelf);

		for (const i of targets.keys()) {
			if (!damage[i] && damage[i] !== 0) targets[i] = false;
		}

		// steps 4 and 5 can mess with this.battle.activeTarget, which needs to be preserved for Dancer
		const activeTarget = this.battle.activeTarget;

		// 4. self drops (start checking for targets[i] === false here)
		if (moveData.self && !move.selfDropped) this.selfDrops(targets, pokemon, move, moveData, isSecondary);

		// 5. secondary effects
		if (moveData.secondaries) this.secondaries(targets, pokemon, move, moveData, isSelf);

		this.battle.activeTarget = activeTarget;

		// 6. force switch
		if (moveData.forceSwitch) damage = this.forceSwitch(damage, targets, pokemon, move);

		for (const i of targets.keys()) {
			if (!damage[i] && damage[i] !== 0) targets[i] = false;
		}

		const damagedTargets: Pokemon[] = [];
		const damagedDamage = [];
		for (const [i, t] of targets.entries()) {
			if (typeof damage[i] === 'number' && t) {
				damagedTargets.push(t);
				damagedDamage.push(damage[i]);
			}
		}
		const pokemonOriginalHP = pokemon.hp;
		if (damagedDamage.length && !isSecondary && !isSelf) {
			if (this.battle.gen >= 5) {
				this.battle.runEvent('DamagingHit', damagedTargets, pokemon, move, damagedDamage);
			}
			if (moveData.onAfterHit && pokemon.hp) {
				for (const t of damagedTargets) {
					this.battle.singleEvent('AfterHit', moveData, {}, t, pokemon, move);
				}
			}
			if (this.battle.gen < 5) {
				this.battle.runEvent('DamagingHit', damagedTargets, pokemon, move, damagedDamage);
			}
			if (pokemon.hp && pokemon.hp <= pokemon.maxhp / 2 && pokemonOriginalHP > pokemon.maxhp / 2) {
				this.battle.runEvent('EmergencyExit', pokemon);
			}
		}

		return [damage, targets];
	}
	},

    init() {
      this.modData("Learnsets", "venusaur").learnset.sludgewave = ["9M"];
	  this.modData("Learnsets", "blastoise").learnset.ironhead = ["9M"];
	  this.modData("Learnsets", "beedrill").learnset.bugbuzz = ["9M"];
	  this.modData("Learnsets", "beedrill").learnset.crosspoison = ["9M"];
	  this.modData("Learnsets", "beedrill").learnset.dualwingbeat = ["9M"];
	  this.modData("Learnsets", "beedrill").learnset.lunge = ["9M"];
	  this.modData("Learnsets", "beedrill").learnset.pollenpuff = ["9M"];
	  this.modData("Learnsets", "beedrill").learnset.skittersmack = ["9M"];
	  this.modData("Learnsets", "pidgeot").learnset.dualwingbeat = ["9M"];
	  this.modData("Learnsets", "raichu").learnset.dazzlinggleam = ["9M"];
	  this.modData("Learnsets", "raichu").learnset.drainpunch = ["9M"];
	  this.modData("Learnsets", "clefable").learnset.airslash = ["9M"];
	  this.modData("Learnsets", "arcaninehisui").learnset.burnup = ["9M"];
	  this.modData("Learnsets", "arcaninehisui").learnset.irontail = ["9M"];
	  this.modData("Learnsets", "machamp").learnset.drainpunch = ["9M"];
	  this.modData("Learnsets", "victreebel").learnset.toxicspikes = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.ancientpower = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.aquajet = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.bulkup = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.chargebeam = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.icespinner = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.liquidation = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.safeguard = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.selfdestruct = ["9M"];
	  this.modData("Learnsets", "starmie").learnset.zenheadbutt = ["9M"];
	  this.modData("Learnsets", "pinsir").learnset.aerialace = ["9M"];
	  this.modData("Learnsets", "pinsir").learnset.hardpress = ["9M"];
	  this.modData("Learnsets", "pinsir").learnset.lunge = ["9M"];
	  this.modData("Learnsets", "taurospaldeacombat").learnset.irontail = ["9M"];
	  this.modData("Learnsets", "taurospaldeacombat").learnset.megahorn = ["9M"];
	  this.modData("Learnsets", "taurospaldeaaqua").learnset.irontail = ["9M"];
	  this.modData("Learnsets", "taurospaldeaaqua").learnset.megahorn = ["9M"];
	  this.modData("Learnsets", "taurospaldeablaze").learnset.irontail = ["9M"];
	  this.modData("Learnsets", "taurospaldeablaze").learnset.megahorn = ["9M"];
	  this.modData("Learnsets", "gyarados").learnset.dragonrush = ["9M"];
	  this.modData("Learnsets", "dragonite").learnset.whirlwind = ["9M"];
	  this.modData("Learnsets", "meganium").learnset.dazzlinggleam = ["9M"];
	  this.modData("Learnsets", "meganium").learnset.earthpower = ["9M"];
	  this.modData("Learnsets", "meganium").learnset.leafblade = ["9M"];
	  this.modData("Learnsets", "meganium").learnset.pollenpuff = ["9M"];
	  this.modData("Learnsets", "typhlosionhisui").learnset.mysticalfire = ["9M"];
	  this.modData("Learnsets", "espeon").learnset.safeguard = ["9M"];
	  this.modData("Learnsets", "forretress").learnset.steelroller = ["9M"];
	  this.modData("Learnsets", "houndoom").learnset.scorchingsands = ["9M"];
	  this.modData("Learnsets", "sableye").learnset.nightslash = ["9M"];
	  this.modData("Learnsets", "sableye").learnset.safeguard = ["9M"];
	  this.modData("Learnsets", "medicham").learnset.agility = ["9M"];
	  this.modData("Learnsets", "medicham").learnset.blazekick = ["9M"];
	  this.modData("Learnsets", "medicham").learnset.coaching = ["9M"];
	  this.modData("Learnsets", "manectric").learnset.supercellslam = ["9M"];
	  this.modData("Learnsets", "manectric").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "camerupt").learnset.burningjealousy = ["9M"];
	  this.modData("Learnsets", "banette").learnset.zenheadbutt = ["9M"];
	  this.modData("Learnsets", "chimecho").learnset.boomburst = ["9M"];
	  this.modData("Learnsets", "chimecho").learnset.flashcannon = ["9M"];
	  this.modData("Learnsets", "chimecho").learnset.selfdestruct = ["9M"];
	  this.modData("Learnsets", "absol").learnset.phantomforce = ["9M"];
	  this.modData("Learnsets", "absol").learnset.shadowsneak = ["9M"];
	  this.modData("Learnsets", "absol").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "roserade").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "rampardos").learnset.meteorbeam = ["9M"];
	  this.modData("Learnsets", "bastiodon").learnset.steelroller = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.cottonguard = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.drainingkiss = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.dynamicpunch = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.machpunch = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.swordsdance = ["9M"];
	  this.modData("Learnsets", "lopunny").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "abomasnow").learnset.icehammer = ["9M"];
	  this.modData("Learnsets", "gliscor").learnset.pinmissile = ["9M"];
	  this.modData("Learnsets", "gliscor").learnset.powerwhip = ["9M"];
	  this.modData("Learnsets", "froslass").learnset.nastyplot = ["9M"];
	  this.modData("Learnsets", "froslass").learnset.phantomforce = ["9M"];
	  this.modData("Learnsets", "emboar").learnset.scorchingsands = ["9M"];
	  this.modData("Learnsets", "emboar").learnset.solarblade = ["9M"];
	  this.modData("Learnsets", "samurotthisui").learnset.superpower = ["9M"];
	  this.modData("Learnsets", "watchog").learnset.doubleedge = ["9M"];
	  this.modData("Learnsets", "watchog").learnset.endure = ["9M"];
	  this.modData("Learnsets", "watchog").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "liepard").learnset.crunch = ["9M"];
	  this.modData("Learnsets", "liepard").learnset.firefang = ["9M"];
	  this.modData("Learnsets", "liepard").learnset.icefang = ["9M"];
	  this.modData("Learnsets", "liepard").learnset.psychicfangs = ["9M"];
	  this.modData("Learnsets", "liepard").learnset.thunderfang = ["9M"];
	  this.modData("Learnsets", "liepard").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "simisage").learnset.belch = ["9M"];
	  this.modData("Learnsets", "simisage").learnset.endure = ["9M"];
	  this.modData("Learnsets", "simisage").learnset.fakeout = ["9M"];
	  this.modData("Learnsets", "simisage").learnset.grassyglide = ["9M"];
	  this.modData("Learnsets", "simisage").learnset.solarblade = ["9M"];
	  this.modData("Learnsets", "simisage").learnset.stuffcheeks = ["9M"];
	  this.modData("Learnsets", "simisage").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "simisear").learnset.blazekick = ["9M"];
	  this.modData("Learnsets", "simisear").learnset.burningjealousy = ["9M"];
	  this.modData("Learnsets", "simisear").learnset.endure = ["9M"];
	  this.modData("Learnsets", "simisear").learnset.fakeout = ["9M"];
	  this.modData("Learnsets", "simisear").learnset.scorchingsands = ["9M"];
	  this.modData("Learnsets", "simisear").learnset.stuffcheeks = ["9M"];
	  this.modData("Learnsets", "simisear").learnset.temperflare = ["9M"];
	  this.modData("Learnsets", "simipour").learnset.belch = ["9M"];
	  this.modData("Learnsets", "simipour").learnset.endure = ["9M"];
	  this.modData("Learnsets", "simipour").learnset.fakeout = ["9M"];
	  this.modData("Learnsets", "simipour").learnset.flipturn = ["9M"];
	  this.modData("Learnsets", "simipour").learnset.liquidation = ["9M"];
	  this.modData("Learnsets", "simipour").learnset.stuffcheeks = ["9M"];
	  this.modData("Learnsets", "excadrill").learnset.megahorn = ["9M"];
	  this.modData("Learnsets", "krookodile").learnset.ironhead = ["9M"];
	  this.modData("Learnsets", "krookodile").learnset.fissure = ["9M"];
	  this.modData("Learnsets", "cofagrigus").learnset.gigadrain = ["9M"];
	  this.modData("Learnsets", "cofagrigus").learnset.selfdestruct = ["9M"];
	  this.modData("Learnsets", "garbodor").learnset.ancientpower = ["9M"];
	  this.modData("Learnsets", "garbodor").learnset.poisonjab = ["9M"];	
	  this.modData("Learnsets", "zoroarkhisui").learnset.payback = ["9M"];
	  this.modData("Learnsets", "vanilluxe").learnset.icespinner = ["9M"];
	  this.modData("Learnsets", "golurk").learnset.headlongrush = ["9M"];
	  this.modData("Learnsets", "golurk").learnset.ironhead = ["9M"];
	  this.modData("Learnsets", "chesnaught").learnset.growth = ["9M"];
	  this.modData("Learnsets", "chesnaught").learnset.steelroller = ["9M"];
	  this.modData("Learnsets", "greninja").learnset.flipturn = ["9M"];
	  this.modData("Learnsets", "greninja").learnset.skittersmack = ["9M"];
	  this.modData("Learnsets", "diggersby").learnset.fissure = ["9M"];
	  this.modData("Learnsets", "diggersby").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "talonflame").learnset.blazekick = ["9M"];
	  this.modData("Learnsets", "talonflame").learnset.skyattack = ["9M"];
	  this.modData("Learnsets", "talonflame").learnset.whirlwind = ["9M"];
	  this.modData("Learnsets", "vivillon").learnset.whirlwind = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.alluringvoice = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.batonpass = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.drainingkiss = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.lightscreen = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.pollenpuff = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.skillswap = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.storedpower = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "floetteeternal").learnset.trick = ["9M"];
      this.modData("Learnsets", "florges").learnset.grassyglide = ["9M"];
	  this.modData("Learnsets", "pangoro").learnset.comeuppance = ["9M"];
	  this.modData("Learnsets", "pangoro").learnset.headlongrush = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.crunch = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.doubleedge = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.endure = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.icefang = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.firefang = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.psychicfangs = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.thunderfang = ["9M"];
	  this.modData("Learnsets", "furfrou").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "meowstic").learnset.wish = ["9M"];
	  this.modData("Learnsets", "aegislash").learnset.poltergeist = ["9M"];
	  this.modData("Learnsets", "aegislash").learnset.zenheadbutt = ["9M"];
	  this.modData("Learnsets", "aromatisse").learnset.alluringvoice = ["9M"];
	  this.modData("Learnsets", "aromatisse").learnset.hypnosis = ["9M"];
	  this.modData("Learnsets", "heliolisk").learnset.morningsun = ["9M"];
	  this.modData("Learnsets", "heliolisk").learnset.shedtail = ["9M"];
	  this.modData("Learnsets", "heliolisk").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "aurorus").learnset.icespinner = ["9M"];
	  this.modData("Learnsets", "hawlucha").learnset.airslash = ["9M"];
	  this.modData("Learnsets", "goodra").learnset.gigadrain = ["9M"];
	  this.modData("Learnsets", "goodrahisui").learnset.ancientpower = ["9M"];
	  this.modData("Learnsets", "klefki").learnset.futuresight = ["9M"];
	  this.modData("Learnsets", "gourgeist").learnset.hypnosis = ["9M"];
	  this.modData("Learnsets", "gourgeist").learnset.selfdestruct = ["9M"];
	  this.modData("Learnsets", "avalugghisui").learnset.ancientpower = ["9M"];
	  this.modData("Learnsets", "crabominable").learnset.iciclespear = ["9M"];
	  this.modData("Learnsets", "crabominable").learnset.machpunch = ["9M"];
	  this.modData("Learnsets", "mimikyu").learnset.nightslash = ["9M"];
	  this.modData("Learnsets", "drampa").learnset.bodyslam = ["9M"];
	  this.modData("Learnsets", "drampa").learnset.earthpower = ["9M"];
	  this.modData("Learnsets", "drampa").learnset.triattack = ["9M"];
	  this.modData("Learnsets", "drampa").learnset.whirlwind = ["9M"];
	  this.modData("Learnsets", "corviknight").learnset.featherdance = ["9M"];
	  this.modData("Learnsets", "mrrime").learnset.frostbreath = ["9M"];
	  this.modData("Learnsets", "mrrime").learnset.haze = ["9M"];
	  this.modData("Learnsets", "mrrime").learnset.icespinner = ["9M"];
	  this.modData("Learnsets", "mrrime").learnset.sheercold = ["9M"];
	  this.modData("Learnsets", "mrrime").learnset.swagger = ["9M"];
	  this.modData("Learnsets", "runerigus").learnset.gigadrain = ["9M"];
	  this.modData("Learnsets", "runerigus").learnset.psyshock = ["9M"];
	  this.modData("Learnsets", "runerigus").learnset.selfdestruct = ["9M"];
	  this.modData("Learnsets", "kleavor").learnset.ancientpower = ["9M"];
	  this.modData("Learnsets", "skeledirge").learnset.burnup = ["9M"];
	  this.modData("Learnsets", "garganacl").learnset.dynamicpunch = ["9M"];
	  this.modData("Learnsets", "ceruledge").learnset.burnup = ["9M"];
	  this.modData("Learnsets", "armarouge").learnset.burnup = ["9M"];
	  this.modData("Learnsets", "scovillain").learnset.flareblitz = ["9M"];
	  this.modData("Learnsets", "scovillain").learnset.swagger = ["9M"];
	  this.modData("Learnsets", "scovillain").learnset.thunderfang = ["9M"];
	  this.modData("Learnsets", "tinkaton").learnset.woodhammer = ["9M"];
	  this.modData("Learnsets", "sceptile").learnset.dragonrush = ["9M"];
	  this.modData("Learnsets", "sceptile").learnset.earthpower = ["9M"];
	  this.modData("Learnsets", "swampert").learnset.sludgebomb = ["9M"];
	  this.modData("Learnsets", "swampert").learnset.wavecrash = ["9M"];
	  this.modData("Learnsets", "staraptor").learnset.blazekick = ["9M"];
	  this.modData("Learnsets", "staraptor").learnset.brickbreak = ["9M"];
	  this.modData("Learnsets", "staraptor").learnset.bulkup = ["9M"];
	  this.modData("Learnsets", "staraptor").learnset.focusblast = ["9M"];
	  this.modData("Learnsets", "scolipede").learnset.gunkshot = ["9M"];
	  this.modData("Learnsets", "scolipede").learnset.leechlife = ["9M"];
	  this.modData("Learnsets", "scolipede").learnset.trailblaze = ["9M"];
	  this.modData("Learnsets", "scrafty").learnset.dynamicpunch = ["9M"];
	  this.modData("Learnsets", "eelektross").learnset.psychicfangs = ["9M"];
	  this.modData("Learnsets", "eelektross").learnset.risingvoltage = ["9M"];
	  this.modData("Learnsets", "eelektross").learnset.waterfall = ["9M"];
	  this.modData("Learnsets", "pyroar").learnset.scorchingsands = ["9M"];
	  this.modData("Learnsets", "malamar").learnset.poisonjab = ["9M"];
	  this.modData("Learnsets", "malamar").learnset.zenheadbutt = ["9M"];
	  this.modData("Learnsets", "barbaracle").learnset.aquacutter = ["9M"];
	  this.modData("Learnsets", "barbaracle").learnset.closecombat = ["9M"];
	  this.modData("Learnsets", "barbaracle").learnset.waterfall = ["9M"];
	  this.modData("Learnsets", "dragalge").learnset.poisonjab = ["9M"];
	  this.modData("Learnsets", "falinks").learnset.seedbomb = ["9M"];
	  this.modData("Learnsets", "houndstone").learnset.swagger = ["9M"];
	  this.modData("Learnsets", "houndstone").learnset.zenheadbutt = ["9M"];
	  this.modData("Learnsets", "gholdengo").learnset.surf = ["9M"];
	  //chapter 3 patch
	  this.modData("Learnsets", "grimmeon").learnset.calmmind = ["9M"];
	  this.modData("Learnsets", "uxieomega").learnset.stealthrock = ["9M"];
	  this.modData("Learnsets", "uxieomega").learnset.taunt = ["9M"];
	  this.modData("Learnsets", "staraptordelta").learnset.sacredfire = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.flamecharge = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.sunnyday = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.flamethrower = ["9M"];
	  this.modData("Learnsets", "zorotales").learnset.fireblast = ["9M"];
	  this.modData("Learnsets", "mespritomega").learnset.stealthrock = ["9M"];
	  this.modData("Learnsets", "hoopadeltaunbound").learnset.mysticalfire = ["9M"];
	  delete this.modData("Learnsets", "shaykarp").learnset.chillingwater;
	  delete this.modData("Learnsets", "celesteelurk").learnset.heatcrash;
	  this.modData("Learnsets", "ampharia").learnset.agility = ["9M"];
	  delete this.modData("Learnsets", "gougeon").learnset.bulkup; 
	  delete this.modData("Learnsets", "apextyrant").learnset.knockoff;
	  delete this.modData("Learnsets", "etherion").learnset.shadowclaw;

	},
};