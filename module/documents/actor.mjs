/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BlackSeasActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags.blackseas || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareShipData(actorData);
    this._prepareIslandData(actorData);
  }
  
  /**
 * Prepare Ship type specific data
 */
_prepareShipData(actorData) {
  if (actorData.type !== 'character') return;

  // Make modifications to data here. For example:
  const data = actorData.data;

  // Loop through ability scores, and add their modifiers to our sheet output.
//  for (let [key, ability] of Object.entries(data.abilities)) {
//    // Calculate the modifier using d20 rules.
//    ability.mod = Math.floor((ability.value - 10) / 2);
//  }

/**
 * Prepare Island type specific data.
 */
_prepareIslandData(actorData) {
  if (actorData.type !== 'island') return;

  // Make modifications to data here. For example:
  const data = actorData.data;
  
//  data.xp = (data.cr * data.cr) * 100;
}
}

/**
 * Override getRollData() that's supplied to rolls.
 */
getRollData() {
  const data = super.getRollData();

  // Prepare Ship roll data.
  this._getShipRollData(data);
  this._getIslandRollData(data);

  return data;
}

/**
 * Prepare Ship roll data.
 */
_getShipRollData(data) {
  if (this.data.type !== 'ship') return;

  // Copy the ability scores to the top level, so that rolls can use
  // formulas like `@str.mod + 4`.
//  if (data.abilities) {
//    for (let [k, v] of Object.entries(data.abilities)) {
//      data[k] = foundry.utils.deepClone(v);
//    }
//  }
//
//  // Add level for easier access, or fall back to 0.
//  if (data.attributes.level) {
//    data.lvl = data.attributes.level.value ?? 0;
//  }
}

/**
 * Prepare Island roll data.
 */
_getIslandRollData(data) {
  if (this.data.type !== 'island') return;

  // Process additional Island data here.
}
}