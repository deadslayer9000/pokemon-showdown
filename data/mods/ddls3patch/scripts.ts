export const Scripts: ModdedBattleScriptsData = {
inherit: 'gen9',
    gen: 9,
    init() {
      this.modData("Learnsets", "venusaur").sludgewave = ["9M"];
    },
};