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
	  delete this.modData("Learnsets", "shaykarp").learnset.chillingwater;
	  delete this.modData("Learnsets", "celesteelurk").learnset.heatcrash;
	  //lmao
	  delete this.modData("Learnsets", "venusaur").learnset.sludgewave;
	  delete this.modData("Learnsets", "blastoise").learnset.ironhead;
	  delete this.modData("Learnsets", "beedrill").learnset.bugbuzz;
	  delete this.modData("Learnsets", "beedrill").learnset.crosspoison;
	  delete this.modData("Learnsets", "beedrill").learnset.dualwingbeat;
	  delete this.modData("Learnsets", "beedrill").learnset.lunge;
	  delete this.modData("Learnsets", "beedrill").learnset.pollenpuff;
	  delete this.modData("Learnsets", "beedrill").learnset.skittersmack;
	  delete this.modData("Learnsets", "pidgeot").learnset.dualwingbeat;
	  delete this.modData("Learnsets", "raichu").learnset.dazzlinggleam;
	  delete this.modData("Learnsets", "raichu").learnset.drainpunch;
	  delete this.modData("Learnsets", "clefable").learnset.airslash;
	  delete this.modData("Learnsets", "arcaninehisui").learnset.burnup;
	  delete this.modData("Learnsets", "arcaninehisui").learnset.irontail;
	  delete this.modData("Learnsets", "machamp").learnset.drainpunch;
	  delete this.modData("Learnsets", "victreebel").learnset.toxicspikes;
	  delete this.modData("Learnsets", "starmie").learnset.ancientpower;
	  delete this.modData("Learnsets", "starmie").learnset.aquajet;
	  delete this.modData("Learnsets", "starmie").learnset.bulkup;
	  delete this.modData("Learnsets", "starmie").learnset.chargebeam;
	  delete this.modData("Learnsets", "starmie").learnset.icespinner;
	  delete this.modData("Learnsets", "starmie").learnset.liquidation;
	  delete this.modData("Learnsets", "starmie").learnset.safeguard;
	  delete this.modData("Learnsets", "starmie").learnset.selfdestruct;
	  delete this.modData("Learnsets", "starmie").learnset.zenheadbutt;
	  delete this.modData("Learnsets", "pinsir").learnset.aerialace;
	  delete this.modData("Learnsets", "pinsir").learnset.hardpress;
	  delete this.modData("Learnsets", "pinsir").learnset.lunge;
	  delete this.modData("Learnsets", "taurospaldeacombat").learnset.irontail;
	  delete this.modData("Learnsets", "taurospaldeacombat").learnset.megahorn;
	  delete this.modData("Learnsets", "taurospaldeaaqua").learnset.irontail;
	  delete this.modData("Learnsets", "taurospaldeaaqua").learnset.megahorn;
	  delete this.modData("Learnsets", "taurospaldeablaze").learnset.irontail;
	  delete this.modData("Learnsets", "taurospaldeablaze").learnset.megahorn;
	  delete this.modData("Learnsets", "gyarados").learnset.dragonrush;
	  delete this.modData("Learnsets", "dragonite").learnset.whirlwind;
	  delete this.modData("Learnsets", "meganium").learnset.dazzlinggleam;
	  delete this.modData("Learnsets", "meganium").learnset.earthpower;
	  delete this.modData("Learnsets", "meganium").learnset.leafblade;
	  delete this.modData("Learnsets", "meganium").learnset.pollenpuff;
	  delete this.modData("Learnsets", "typhlosionhisui").learnset.mysticalfire;
	  delete this.modData("Learnsets", "espeon").learnset.safeguard;
	  delete this.modData("Learnsets", "forretress").learnset.steelroller;
	  delete this.modData("Learnsets", "houndoom").learnset.scorchingsands;
	  delete this.modData("Learnsets", "sableye").learnset.nightslash;
	  delete this.modData("Learnsets", "sableye").learnset.safeguard;
	  delete this.modData("Learnsets", "medicham").learnset.agility;
	  delete this.modData("Learnsets", "medicham").learnset.blazekick;
	  delete this.modData("Learnsets", "medicham").learnset.coaching;
	  delete this.modData("Learnsets", "manectric").learnset.supercellslam;
	  delete this.modData("Learnsets", "manectric").learnset.trailblaze;
	  delete this.modData("Learnsets", "camerupt").learnset.burningjealousy;
	  delete this.modData("Learnsets", "banette").learnset.zenheadbutt;
	  delete this.modData("Learnsets", "chimecho").learnset.boomburst;
	  delete this.modData("Learnsets", "chimecho").learnset.flashcannon;
	  delete this.modData("Learnsets", "chimecho").learnset.selfdestruct;
	  delete this.modData("Learnsets", "absol").learnset.phantomforce;
	  delete this.modData("Learnsets", "absol").learnset.shadowsneak;
	  delete this.modData("Learnsets", "absol").learnset.trailblaze;
	  delete this.modData("Learnsets", "roserade").learnset.trailblaze;
	  delete this.modData("Learnsets", "rampardos").learnset.meteorbeam;
	  delete this.modData("Learnsets", "bastiodon").learnset.steelroller;
	  delete this.modData("Learnsets", "lopunny").learnset.cottonguard;
	  delete this.modData("Learnsets", "lopunny").learnset.drainingkiss;
	  delete this.modData("Learnsets", "lopunny").learnset.dynamicpunch;
	  delete this.modData("Learnsets", "lopunny").learnset.machpunch;
	  delete this.modData("Learnsets", "lopunny").learnset.swordsdance;
	  delete this.modData("Learnsets", "lopunny").learnset.trailblaze;
	  delete this.modData("Learnsets", "abomasnow").learnset.icehammer;
	  delete this.modData("Learnsets", "gliscor").learnset.pinmissile;
	  delete this.modData("Learnsets", "gliscor").learnset.powerwhip;
	  delete this.modData("Learnsets", "froslass").learnset.nastyplot;
	  delete this.modData("Learnsets", "froslass").learnset.phantomforce;
	  delete this.modData("Learnsets", "emboar").learnset.scorchingsands;
	  delete this.modData("Learnsets", "emboar").learnset.solarblade;
	  delete this.modData("Learnsets", "samurotthisui").learnset.superpower;
	  delete this.modData("Learnsets", "watchog").learnset.doubleedge;
	  delete this.modData("Learnsets", "watchog").learnset.endure;
	  delete this.modData("Learnsets", "watchog").learnset.trailblaze;
	  delete this.modData("Learnsets", "liepard").learnset.crunch;
	  delete this.modData("Learnsets", "liepard").learnset.firefang;
	  delete this.modData("Learnsets", "liepard").learnset.icefang;
	  delete this.modData("Learnsets", "liepard").learnset.psychicfangs;
	  delete this.modData("Learnsets", "liepard").learnset.thunderfang;
	  delete this.modData("Learnsets", "liepard").learnset.trailblaze;
	  delete this.modData("Learnsets", "simisage").learnset.belch;
	  delete this.modData("Learnsets", "simisage").learnset.endure;
	  delete this.modData("Learnsets", "simisage").learnset.fakeout;
	  delete this.modData("Learnsets", "simisage").learnset.grassyglide;
	  delete this.modData("Learnsets", "simisage").learnset.solarblade;
	  delete this.modData("Learnsets", "simisage").learnset.stuffcheeks;
	  delete this.modData("Learnsets", "simisage").learnset.trailblaze;
	  delete this.modData("Learnsets", "simisear").learnset.blazekick;
	  delete this.modData("Learnsets", "simisear").learnset.burningjealousy;
	  delete this.modData("Learnsets", "simisear").learnset.endure;
	  delete this.modData("Learnsets", "simisear").learnset.fakeout;
	  delete this.modData("Learnsets", "simisear").learnset.scorchingsands;
	  delete this.modData("Learnsets", "simisear").learnset.stuffcheeks;
	  delete this.modData("Learnsets", "simisear").learnset.temperflare;
	  delete this.modData("Learnsets", "simipour").learnset.belch;
	  delete this.modData("Learnsets", "simipour").learnset.endure;
	  delete this.modData("Learnsets", "simipour").learnset.fakeout;
	  delete this.modData("Learnsets", "simipour").learnset.flipturn;
	  delete this.modData("Learnsets", "simipour").learnset.liquidation;
	  delete this.modData("Learnsets", "simipour").learnset.stuffcheeks;
	  delete this.modData("Learnsets", "excadrill").learnset.megahorn;
	  delete this.modData("Learnsets", "krookodile").learnset.ironhead;
	  delete this.modData("Learnsets", "krookodile").learnset.fissure;
	  delete this.modData("Learnsets", "cofagrigus").learnset.gigadrain;
	  delete this.modData("Learnsets", "cofagrigus").learnset.selfdestruct;
	  delete this.modData("Learnsets", "garbodor").learnset.ancientpower;
	  delete this.modData("Learnsets", "garbodor").learnset.poisonjab;	
	  delete this.modData("Learnsets", "zoroarkhisui").learnset.payback;
	  delete this.modData("Learnsets", "vanilluxe").learnset.icespinner;
	  delete this.modData("Learnsets", "golurk").learnset.headlongrush;
	  delete this.modData("Learnsets", "golurk").learnset.ironhead;
	  delete this.modData("Learnsets", "chesnaught").learnset.growth;
	  delete this.modData("Learnsets", "chesnaught").learnset.steelroller;
	  delete this.modData("Learnsets", "greninja").learnset.flipturn;
	  delete this.modData("Learnsets", "greninja").learnset.skittersmack;
	  delete this.modData("Learnsets", "diggersby").learnset.fissure;
	  delete this.modData("Learnsets", "diggersby").learnset.trailblaze;
	  delete this.modData("Learnsets", "talonflame").learnset.blazekick;
	  delete this.modData("Learnsets", "talonflame").learnset.skyattack;
	  delete this.modData("Learnsets", "talonflame").learnset.whirlwind;
	  delete this.modData("Learnsets", "vivillon").learnset.whirlwind;
	  delete this.modData("Learnsets", "floetteeternal").learnset.alluringvoice;
	  delete this.modData("Learnsets", "floetteeternal").learnset.batonpass;
	  delete this.modData("Learnsets", "floetteeternal").learnset.drainingkiss;
	  delete this.modData("Learnsets", "floetteeternal").learnset.lightscreen;
	  delete this.modData("Learnsets", "floetteeternal").learnset.pollenpuff;
	  delete this.modData("Learnsets", "floetteeternal").learnset.skillswap;
	  delete this.modData("Learnsets", "floetteeternal").learnset.storedpower;
	  delete this.modData("Learnsets", "floetteeternal").learnset.trailblaze;
	  delete this.modData("Learnsets", "floetteeternal").learnset.trick;
      delete this.modData("Learnsets", "florges").learnset.grassyglide;
	  delete this.modData("Learnsets", "pangoro").learnset.comeuppance;
	  delete this.modData("Learnsets", "pangoro").learnset.headlongrush;
	  delete this.modData("Learnsets", "furfrou").learnset.crunch;
	  delete this.modData("Learnsets", "furfrou").learnset.doubleedge;
	  delete this.modData("Learnsets", "furfrou").learnset.endure;
	  delete this.modData("Learnsets", "furfrou").learnset.icefang;
	  delete this.modData("Learnsets", "furfrou").learnset.firefang;
	  delete this.modData("Learnsets", "furfrou").learnset.psychicfangs;
	  delete this.modData("Learnsets", "furfrou").learnset.thunderfang;
	  delete this.modData("Learnsets", "furfrou").learnset.trailblaze;
	  delete this.modData("Learnsets", "meowstic").learnset.wish;
	  delete this.modData("Learnsets", "aegislash").learnset.poltergeist;
	  delete this.modData("Learnsets", "aegislash").learnset.zenheadbutt;
	  delete this.modData("Learnsets", "aromatisse").learnset.alluringvoice;
	  delete this.modData("Learnsets", "aromatisse").learnset.hypnosis;
	  delete this.modData("Learnsets", "heliolisk").learnset.morningsun;
	  delete this.modData("Learnsets", "heliolisk").learnset.shedtail;
	  delete this.modData("Learnsets", "heliolisk").learnset.trailblaze;
	  delete this.modData("Learnsets", "aurorus").learnset.icespinner;
	  delete this.modData("Learnsets", "hawlucha").learnset.airslash;
	  delete this.modData("Learnsets", "goodra").learnset.gigadrain;
	  delete this.modData("Learnsets", "goodrahisui").learnset.ancientpower;
	  delete this.modData("Learnsets", "klefki").learnset.futuresight;
	  delete this.modData("Learnsets", "gourgeist").learnset.hypnosis;
	  delete this.modData("Learnsets", "gourgeist").learnset.selfdestruct;
	  delete this.modData("Learnsets", "avalugghisui").learnset.ancientpower;
	  delete this.modData("Learnsets", "crabominable").learnset.iciclespear;
	  delete this.modData("Learnsets", "crabominable").learnset.machpunch;
	  delete this.modData("Learnsets", "mimikyu").learnset.nightslash;
	  delete this.modData("Learnsets", "drampa").learnset.bodyslam;
	  delete this.modData("Learnsets", "drampa").learnset.earthpower;
	  delete this.modData("Learnsets", "drampa").learnset.triattack;
	  delete this.modData("Learnsets", "drampa").learnset.whirlwind;
	  delete this.modData("Learnsets", "corviknight").learnset.featherdance;
	  delete this.modData("Learnsets", "mrrime").learnset.frostbreath;
	  delete this.modData("Learnsets", "mrrime").learnset.haze;
	  delete this.modData("Learnsets", "mrrime").learnset.icespinner;
	  delete this.modData("Learnsets", "mrrime").learnset.sheercold;
	  delete this.modData("Learnsets", "mrrime").learnset.swagger;
	  delete this.modData("Learnsets", "runerigus").learnset.gigadrain;
	  delete this.modData("Learnsets", "runerigus").learnset.psyshock;
	  delete this.modData("Learnsets", "runerigus").learnset.selfdestruct;
	  delete this.modData("Learnsets", "kleavor").learnset.ancientpower;
	  delete this.modData("Learnsets", "skeledirge").learnset.burnup;
	  delete this.modData("Learnsets", "garganacl").learnset.dynamicpunch;
	  delete this.modData("Learnsets", "ceruledge").learnset.burnup;
	  delete this.modData("Learnsets", "armarouge").learnset.burnup;
	  delete this.modData("Learnsets", "scovillain").learnset.flareblitz;
	  delete this.modData("Learnsets", "scovillain").learnset.swagger;
	  delete this.modData("Learnsets", "scovillain").learnset.thunderfang;
	  delete this.modData("Learnsets", "tinkaton").learnset.woodhammer;
	  delete this.modData("Learnsets", "sceptile").learnset.dragonrush;
	  delete this.modData("Learnsets", "sceptile").learnset.earthpower;
	  delete this.modData("Learnsets", "swampert").learnset.sludgebomb;
	  delete this.modData("Learnsets", "swampert").learnset.wavecrash;
	  delete this.modData("Learnsets", "staraptor").learnset.blazekick;
	  delete this.modData("Learnsets", "staraptor").learnset.brickbreak;
	  delete this.modData("Learnsets", "staraptor").learnset.bulkup;
	  delete this.modData("Learnsets", "staraptor").learnset.focusblast;
	  delete this.modData("Learnsets", "scolipede").learnset.gunkshot;
	  delete this.modData("Learnsets", "scolipede").learnset.leechlife;
	  delete this.modData("Learnsets", "scolipede").learnset.trailblaze;
	  delete this.modData("Learnsets", "scrafty").learnset.dynamicpunch;
	  delete this.modData("Learnsets", "eelektross").learnset.psychicfangs;
	  delete this.modData("Learnsets", "eelektross").learnset.risingvoltage;
	  delete this.modData("Learnsets", "eelektross").learnset.waterfall;
	  delete this.modData("Learnsets", "pyroar").learnset.scorchingsands;
	  delete this.modData("Learnsets", "malamar").learnset.poisonjab;
	  delete this.modData("Learnsets", "malamar").learnset.zenheadbutt;
	  delete this.modData("Learnsets", "barbaracle").learnset.aquacutter;
	  delete this.modData("Learnsets", "barbaracle").learnset.closecombat;
	  delete this.modData("Learnsets", "barbaracle").learnset.waterfall;
	  delete this.modData("Learnsets", "dragalge").learnset.poisonjab;
	  delete this.modData("Learnsets", "falinks").learnset.seedbomb;
	  delete this.modData("Learnsets", "houndstone").learnset.swagger;
	  delete this.modData("Learnsets", "houndstone").learnset.zenheadbutt;
	  delete this.modData("Learnsets", "gholdengo").learnset.surf;
	},
};