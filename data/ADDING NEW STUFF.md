WHERE TO ADD NEW SPRITES AND BATTLE EFFECTS    
==========
Sprites aren't handled by the server itself, instead by the client (https://github.com/deadslayer9000/pokemon-showdown-client). And while the client may handle the sprites themselves, it does not hold them, that's handled by the sprite repository (https://github.com/deadslayer9000/cobblemon-delta-showdown-sprites). You'll need to contribute to those two in order to add new sprites or replace existing sprites for Pokemon.

Adding New Pokemon Teambuilder Sprites
------

Where to contribute: cobblemon-delta-showdown-sprites
How to contribute:
- Go into the play.pokemonshowdown.com folder, then the sprites folder.
- Find the gen5 folder for new Pokemon, or the dex folder for variants of Pokemon
- Add your sprite under the same name as the Pokemon. (If it's a variant, it's name will often be it's base species name followed by the form. So Ultra-Serperior becomes serperior-ultra.png when contributing).
- Give the client a moment to refresh and make the image appear.

Adding New Pokemon Minisprites
-----
These are the little icons that represent the Pokemon in your party.
Where to contribute: cobblemon-delta-showdown-sprites, pokemon-showdown-client
How to contribute: 
Sprite Repository:
- Go into the play.pokemonshowdown.com folder, then access the pokemonicon-sheet.png
- Look for an open spot at the bottom of the sheet (if there's no open space, make the sheet bigger in increments of thirty pixels)
- Add your minisprite to the next open spot (each minisprite is 40x30, if you're having trouble visualizing it, a grid image is provided in the repository)

Client:
- Go into the play.pokemonshowdown.com folder, then the src folder.
- Open battledex-data.ts.
- Ctrl + F to find the "Delta Mons" comment.
- Add in the name of the Pokemon you added a minisprite for, then follow it with '1596 + x", where x is the most recent sprite's number plus one. (e.g. if you're adding a sprite after cosmachi, which is number 0, you'd add '1596 + 1' to the end of your declaration)

Adding Full Pokemon Battle Sprites
-----
Where to contribute: cobblemon-delta-showdown-sprites
How to contribute:
- Go into the play.pokemonshowdown.com folder, then the sprites folder.
- You'll need to add a front sprite, back sprite, then animated versions of both of those, then shiny versions (optional) of all of those for the Pokemon to render properly in battle.
- Add your front sprite into dex or gen5 (read the Adding Pokemon Sprites part for clarification), back sprite into gen5-back, then animated front sprite into gen5ani, and animated back sprite into gen5ani-back 
- Repeat for the shiny variations of those sprites. (look for the -shiny suffix in the folder name)

Adding New Item Sprites
-----
Where to contribute: cobblemon-delta-showdown-sprites, pokemon-showdown
How to contribute:
Sprite Repository:
- Go into the play.pokemonshowdown.com folder, then the sprites folder.
- Open itemicons-sheet.png
- Look for an open slot and add the image (slots are 24x24, use the reference cube in the corner to figure out how big the sprite squares are)
Server:
- Go into the data folder, then open items.ts
- Look for the item you're adding a sprite for
- Change its spritenum to your slot's sprite number. (16 items in each row, left to right. Showdown starts counting at 0, so take the position of your item and subtract one from it)

Adding New Weather/Terrain backgrounds
-----
Where to contribute: cobblemon-delta-showdown-sprites, pokemon-showdown-client
How to contribute:
Sprite Repository:
- Go into the play.pokemonshowdown.com folder, then the fx folder.
- Add the image of the weather you're adding.

Client:
- Go into the play.pokemonshowdown.com folder, then the style folder.
- Open battle.css
- Make a new entry where the other weathers and terrains are (look at the other weather implementation for formatting, color should be at least similar to the background, but doesn't matter much)
