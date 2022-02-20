/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BlackSeasActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["blackseas", "sheet", "actor"],
      template: "systems/blackseas/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
    });
  }

  /** @override */
  get template() {
    return `systems/blackseas/templates/actor/actor-${this.actor.data.type}-sheet.html`;
  }
  
  /* -------------------------------------------- */

/** @override */
getData() {
  // Retrieve the data structure from the base sheet. You can inspect or log
  // the context variable to see the structure, but some key properties for
  // sheets are the actor object, the data object, whether or not it's
  // editable, the items array, and the effects array.
  const context = super.getData();

  // Use a safe clone of the actor data for further operations.
  const actorData = context.actor.data;

  // Add the actor's data to context.data for easier access, as well as flags.
  context.data = actorData.data;
  context.flags = actorData.flags;

  // Prepare character data and items.
  if (actorData.type == 'ship') {
    this._prepareItems(context);
    this._prepareShipData(context);
  }

  // Prepare NPC data and items.
  if (actorData.type == 'island') {
    this._prepareItems(context);
  }

  // Add roll data for TinyMCE editors.
  context.rollData = context.actor.getRollData();

  // Prepare active effects
  context.effects = prepareActiveEffectCategories(this.actor.effects);

  return context;
}

/**
 * Organize and classify Items for Character sheets.
 *
 * @param {Object} actorData The actor to prepare.
 *
 * @return {undefined}
 */
_prepareItems(context) {
  // Initialize containers.
//  const gear = [];
//  const features = [];
  const cannon = {
    0: [],
    1: [],
    2: [],
    3: [],
//    4: [],
//    5: [],
//    6: [],
//    7: [],
//    8: [],
//    9: []
  };

  // Iterate through items, allocating to containers
  for (let i of context.items) {
    i.img = i.img || DEFAULT_TOKEN;
    // Append to gear.
    if (i.type === 'cannon') {
      cannon.push(i);
    }
//    // Append to features.
//    else if (i.type === 'feature') {
//      features.push(i);
//    }
//    // Append to spells.
//    else if (i.type === 'spell') {
//      if (i.data.spellLevel != undefined) {
//        spells[i.data.spellLevel].push(i);
//      }
//    }
  v}

  // Assign and return
//  context.gear = gear;
//  context.features = features;
  context.cannon = cannon;
}

/**
 * Organize and classify Items for Ship sheets.
 *
 * @param {Object} actorData The actor to prepare.
 *
 * @return {undefined}
 */
_prepareShipData(context) {
  // Handle ability scores.
//  for (let [k, v] of Object.entries(context.data.abilities)) {
//    v.label = game.i18n.localize(CONFIG.BLACKSEAS.abilities[k]) ?? k;
//  }
}

// Add roll data for TinyMCE editors.
context.rollData = context.actor.getRollData();

return context;

/** @override */
activateListeners(html) {
  super.activateListeners(html);

  // Render the item sheet for viewing/editing prior to the editable check.
  html.find('.item-edit').click(ev => {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.sheet.render(true);
  });

  // -------------------------------------------------------------
  // Everything below here is only needed if the sheet is editable
  if (!this.isEditable) return;

  // Add Inventory Item
  html.find('.item-create').click(this._onItemCreate.bind(this));

  // Delete Inventory Item
  html.find('.item-delete').click(ev => {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
    li.slideUp(200, () => this.render(false));
  });
}

/* -------------------------------------------- */

/**
 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
 * @param {Event} event   The originating click event
 * @private
 */
async _onItemCreate(event) {
  event.preventDefault();
  const header = event.currentTarget;
  // Get the type of item to create.
  const type = header.dataset.type;
  // Grab any data associated with this control.
  const data = duplicate(header.dataset);
  // Initialize a default name.
  const name = `New ${type.capitalize()}`;
  // Prepare the item object.
  const itemData = {
    name: name,
    type: type,
    data: data
  };
  // Remove the type from the dataset since it's in the itemData.type prop.
  delete itemData.data["type"];

  // Finally, create the item!
  return await Item.create(itemData, {parent: this.actor});
}

}