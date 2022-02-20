// JavaScript Document
/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Black Seas system.
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

    // Make separate methods for each Actor type (ship, island, etc.) to keep
    // things organized.
    this._prepareShipData(actorData);
    this._prepareIslandData(actorData);
  }
    
/**
 * Prepare Ship type specific data
 */
_prepareShipData(actorData) {
  if (actorData.type !== 'ship') return;

  // Make modifications to data here. For example:
  const data = actorData.data;

  // Loop through ability scores, and add their modifiers to our sheet output.
  for (let [key, health] of Object.entries(data.health)) {
    // Calculate the modifier using d20 rules.
    health.surrender = Math.floor(health.max / 3);
  }
  data.xp = (data.cout * data.cout) / 1000;
}
    
/**
 * Prepare Island type specific data.
 */
_prepareIslandData(actorData) {
  if (actorData.type !== 'island') return;

  // Make modifications to data here. For example:
  const data = actorData.data;
  data.xp = (data.cout * data.cout) / 1000;
}

/**
 * Override getRollData() that's supplied to rolls.
 */
getRollData() {
  const data = super.getRollData();

  // Prepare character roll data.
  this._getShipRollData(data);
  this._getIslandRollData(data);

  return data;
}

/**
 * Prepare character roll data.
 */
_getCharacterRollData(data) {
  if (this.data.type !== 'ship') return;

  // Process additional Ship data here.
}

/**
 * Prepare NPC roll data.
 */
_getIslandRollData(data) {
  if (this.data.type !== 'island') return;

  // Process additional Island data here.
}
}
    