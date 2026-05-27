export const Scripts: ModdedBattleScriptsData = {
inherit: 'gen9',
    gen: 9,
		pokemon: { //""hardcode"" designed specifically for moonwake because neutralizing gas is hardcoded, e.g. moonwake is now hardcoded e.g. I gotta paste this in to disable that + dawnbreak's immunity to it
		inherit: true,
		ignoringAbility() {
		if (this.battle.gen >= 5 && !this.isActive) return true;

		// Certain Abilities won't activate while Transformed, even if they ordinarily couldn't be suppressed (e.g. Disguise)
		if (this.getAbility().flags['notransform'] && this.transformed) return true;
		if (this.getAbility().flags['cantsuppress']) return false;
		if (this.volatiles['gastroacid']) return true;

		// Check if any active pokemon have the ability Neutralizing Gas
		if (this.hasItem('Ability Shield') || this.ability === ('neutralizinggas' as ID)) return false;
		for (const pokemon of this.battle.getAllActive()) {
			// can't use hasAbility because it would lead to infinite recursion
			if (pokemon.ability === ('neutralizinggas' as ID) && !pokemon.volatiles['gastroacid'] &&
				!pokemon.transformed && !pokemon.abilityState.ending && !this.volatiles['commanding']) {
				return true;
			}
		}

		return false;
	}
}, 
	actions: {
		inherit: true,
		modifyDamage(baseDamage: number, pokemon: Pokemon, target: Pokemon, move: ActiveMove, suppressMessages = false) {
			const tr = this.battle.trunc;
		if (!move.type) move.type = '???';
		const type = move.type;

		baseDamage += 2;

		if (move.spreadHit) {
			// multi-target modifier (doubles only)
			const spreadModifier = this.battle.gameType === 'freeforall' ? 0.5 : 0.75;
			this.battle.debug(`Spread modifier: ${spreadModifier}`);
			baseDamage = this.battle.modify(baseDamage, spreadModifier);
		} else if (move.multihitType === 'parentalbond' && move.hit > 1) {
			// Parental Bond modifier
			const bondModifier = this.battle.gen > 6 ? 0.25 : 0.5;
			this.battle.debug(`Parental Bond modifier: ${bondModifier}`);
			baseDamage = this.battle.modify(baseDamage, bondModifier);
		} else if (move.multihitType === 'spectreonslaught' && move.hit > 1) {
			const spectreModifier = 0.1; 
			this.battle.debug(`Spectre Onslaught modifier: ${spectreModifier}`);
			baseDamage = this.battle.modify(baseDamage, spectreModifier);
		}

		// weather modifier
		baseDamage = this.battle.runEvent('WeatherModifyDamage', pokemon, target, move, baseDamage);

		// crit - not a modifier
		const isCrit = target.getMoveHitData(move).crit;
		if (isCrit) {
			baseDamage = tr(baseDamage * (move.critModifier || (this.battle.gen >= 6 ? 1.5 : 2)));
		}

		// random factor - also not a modifier
		baseDamage = this.battle.randomizer(baseDamage);

		// STAB
		// The "???" type never gets STAB
		// Not even if you Roost in Gen 4 and somehow manage to use
		// Struggle in the same turn.
		// (On second thought, it might be easier to get a MissingNo.)
		if (type !== '???') {
			let stab: number | [number, number] = 1;

			const isSTAB = move.forceSTAB || pokemon.hasType(type) || pokemon.getTypes(false, true).includes(type);
			if (isSTAB) {
				stab = 1.5;
			}

			// The Stellar tera type makes this incredibly confusing
			// If the move's type does not match one of the user's base types,
			// the Stellar tera type applies a one-time 1.2x damage boost for that type.
			//
			// If the move's type does match one of the user's base types,
			// then the Stellar tera type applies a one-time 2x STAB boost for that type,
			// and then goes back to using the regular 1.5x STAB boost for those types.
			if (pokemon.terastallized === 'Stellar') {
				if (!pokemon.stellarBoostedTypes.includes(type) || move.stellarBoosted) {
					stab = isSTAB ? 2 : [4915, 4096];
					move.stellarBoosted = true;
					if (pokemon.species.name !== 'Terapagos-Stellar') {
						pokemon.stellarBoostedTypes.push(type);
					}
				}
			} else {
				if (pokemon.terastallized === type && pokemon.getTypes(false, true).includes(type)) {
					stab = 2;
				}
				stab = this.battle.runEvent('ModifySTAB', pokemon, target, move, stab);
			}

			baseDamage = this.battle.modify(baseDamage, stab);
		}

		// types
		let typeMod = target.runEffectiveness(move);
		typeMod = this.battle.clampIntRange(typeMod, -6, 6);
		target.getMoveHitData(move).typeMod = typeMod;
		if (typeMod > 0) {
			if (!suppressMessages) this.battle.add('-supereffective', target);

			for (let i = 0; i < typeMod; i++) {
				baseDamage *= 2;
			}
		}
		if (typeMod < 0) {
			if (!suppressMessages) this.battle.add('-resisted', target);

			for (let i = 0; i > typeMod; i--) {
				baseDamage = tr(baseDamage / 2);
			}
		}

		if (isCrit && !suppressMessages) this.battle.add('-crit', target);

		if (pokemon.status === 'brn' && move.category === 'Physical' && (!pokemon.hasAbility('guts') && !pokemon.hasAbility('vorpal'))) {
			if (this.battle.gen < 6 || (move.id !== 'facade' && move.id !== 'barbaricincision')) {
				baseDamage = this.battle.modify(baseDamage, 0.5);
			}
		}

		// Generation 5, but nothing later, sets damage to 1 before the final damage modifiers
		if (this.battle.gen === 5 && !baseDamage) baseDamage = 1;

		// Final modifier. Modifiers that modify damage after min damage check, such as Life Orb.
		baseDamage = this.battle.runEvent('ModifyDamage', pokemon, target, move, baseDamage);

		if (target.getMoveHitData(move).brokeProtect) {
			baseDamage = this.battle.modify(baseDamage, 0.25);
			if (move.isZOrMaxPowered) this.battle.add('-zbroken', target);
		}

		// Generation 6-7 moves the check for minimum 1 damage after the final modifier...
		if (this.battle.gen !== 5 && !baseDamage) return 1;

		// ...but 16-bit truncation happens even later, and can truncate to 0
		return tr(baseDamage, 16);
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
	  //delta changes
	  this.modData("Learnsets", "grimmsnarldelta").learnset.iciclespear = ["9M"];
	  delete this.modData("Learnsets", "keldeodelta").learnset.vacuumwave;
	  this.modData("Learnsets", "chansey").learnset.wish = ["9M"];
	  this.modData("Learnsets", "chansey").learnset.teleport = ["9M"];
	}
};