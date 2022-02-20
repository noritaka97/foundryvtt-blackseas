/**
 * Black Seas
 * Author: Noritaka
 */

// Import document classes.
import { BlackSeasActor } from "./documents/actor.mjs";
import { BlackSeasItem } from "./documents/item.mjs";
// Import sheet classes.
import { BlackSeasActorSheet } from "./sheets/actor-sheet.mjs";
import { BlackSeasItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { BLACKSEAS } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.blackseas = {
    BlackSeasActor,
    BlackSeasItem,
  };

  // Add custom constants for configuration.
  CONFIG.BLACKSEAS = BLACKSEAS;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
//  CONFIG.Combat.initiative = {
//    formula: "1d20 + @abilities.dex.mod",
//    decimals: 2
//  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = BlackSeasActor;
  CONFIG.Item.documentClass = BlackSeasItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("BlackSeas", BlackSeasActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("BlackSeas", BlackSeasItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", function() {
  // Include steps that need to happen after Foundry has fully loaded here.
});
