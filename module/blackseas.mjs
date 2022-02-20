// JavaScript Document

// Import document classes.
import { BlackSeasActor } from "./documents/actor.mjs";
// import { BlackSeasItem } from "./documents/item.mjs";
// Import sheet classes.
import { BlackSeasActorSheet } from "./sheets/actor-sheet.mjs";
//import { BlackSeasItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
//import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
//import { BLACKSEAS } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.blackseas = {
    BlackSeasActor,
//    BlackSeasItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.BLACKSEAS = BLACKSEAS;

  // Define custom Document classes
  CONFIG.Actor.documentClass = BlackSeasActor;
//  CONFIG.Item.documentClass = BlackSeasItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("blackseas", BlackSeasActorSheet, { makeDefault: true });
//  Items.unregisterSheet("core", ItemSheet);
//  Items.registerSheet("blackseas", BlackSeasItemSheet, { makeDefault: true });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createBlackSeasMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createBlackSeasMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.blackseas.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "blackseas.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}
