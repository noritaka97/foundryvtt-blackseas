// Import document classes.
import { XwingActor } from "./documents/actor.mjs";
import { XwingItem } from "./documents/item.mjs";
// Import sheet classes.
import { XwingActorSheet, XwingEditSheet } from "./sheets/actor-sheet.mjs";
import { XwingItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { XWING } from "./helpers/config.mjs";

import {executeManeuver, barrelRoll} from './helpers/maneuvers.mjs';
import {ManeuverSelection, BarrelRollApp} from './apps.mjs';

import {AttackDie} from './dice/dice.js';
import {DefenseDie} from './dice/dice.js';
import {RollXWing} from './dice/roll.js';

import {XwingCombat, XwingCombatTracker} from './combat.js';


/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.xwing = {
    XwingActor,
    XwingItem,
    rollItemMacro,
    executeManeuver,
    ManeuverSelection,
    barrelRoll,
    BarrelRollApp
  };

  // Add custom constants for configuration.
  CONFIG.XWING = XWING;

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "@pilotskill",
    decimals: 2
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = XwingActor;
  CONFIG.Item.documentClass = XwingItem;
  CONFIG.Combat.documentClass = XwingCombat;
  CONFIG.ui.combat = XwingCombatTracker;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("xwing", XwingActorSheet, { label: "Gameplay sheet", makeDefault: true  });
  Actors.registerSheet("xwing", XwingEditSheet, { label: "Edit sheet"});
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("xwing", XwingItemSheet, { makeDefault: true });

  // Define custom Roll class
  CONFIG.Dice.rolls.push(CONFIG.Dice.rolls[0]);
  CONFIG.Dice.rolls[0] = RollXWing;
  
  // Register dice types
  CONFIG.Dice.terms["a"] = AttackDie;
  CONFIG.Dice.terms["d"] = DefenseDie;

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('ternary', function(test, yes, no) {
    return test ? yes : no;
});

Handlebars.registerHelper('grabSpeed', function(input) {
  return input.charAt(0);
});

Handlebars.registerHelper('in', function(check, inList) {
  return inList.includes(check);
});

Handlebars.registerHelper('renderManeuver', function(input) {
  let {color, speed, shape}  = input.match(/(?<color>[grw])?(?<speed>[0-9])(?<shape>[a-z]{1,2})/).groups;
  //let speed = input.charAt(0);
  let maneuver = speed==='0' ? CONFIG.XWING.icons.maneuvers.stop : CONFIG.XWING.icons.maneuvers[shape]
  return speed+maneuver;
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addSystem({id: "xwing", name: "X-Wing Minis"}, "preferred");

  dice3d.addColorset({
    name:'red',
    description: 'Red Attack Dice',
    category: "Colors",
    foreground: "#ffffff",
    // background: '#951814' // From camera
    background: '#FF0000',
  });
  dice3d.addColorset({
    name:'green',
    description: 'Green Defense Dice',
    category: "Colors",
    foreground: "#ffffff",
    // background: '#015021' // From camera
    background: '#07780b'
  });

  dice3d.addDicePreset({
    type: "da",
    labels: ['','','f','f','d','d','d','c'],
    system:'xwing',
    font:'XWing',
    colorset:'red'
  }, 'd8');
  dice3d.addDicePreset({
    type: "dd",
    labels: ['','','','f','f','e','e','e'],
    system:'xwing',
    font:'XWing',
    colorset:'green'
  }, 'd8');

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
async function createItemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.xwing.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "xwing.itemMacro": true }
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
