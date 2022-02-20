// JavaScript Document
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

  // Prepare ship data and items.
  if (actorData.type == 'ship') {
    this._prepareItems(context);
    this._prepareShipData(context);
  }

  // Prepare Island data and items.
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
 * Organize and classify Items for Ship sheets.
 *
 * @param {Object} actorData The actor to prepare.
 *
 * @return {undefined}
 */
_prepareItems(context) {
  // Initialize containers.
  const gear = [];
  const features = [];
  const cannons = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: []  };

  // Iterate through items, allocating to containers
  for (let i of context.items) {
    i.img = i.img || DEFAULT_TOKEN;
    if (i.type === 'cannons') {
    }
  }

  // Assign and return
//  context.gear = gear;
//  context.features = features;
  context.cannons = cannons;
}
    
/**
 * Organize and classify Items for Ship sheets.
 *
 * @param {Object} actorData The actor to prepare.
 *
 * @return {undefined}
 */
_prepareShipData(context) {
  
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

  // Update Inventory Item
  html.find('.item-edit').click(ev => {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.getOwnedItem(li.data("itemId"));
    item.sheet.render(true);
  });

  // Delete Inventory Item
  html.find('.item-delete').click(ev => {
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    item.delete();
    li.slideUp(200, () => this.render(false));
  });
    
  // Rollable abilities.
  html.find('.rollable').click(this._onRoll.bind(this));

// Drag events for macros.
if (this.actor.owner) {
  let handler = ev => this._onDragStart(ev);
  // Find all items on the character sheet.
  html.find('li.item').each((i, li) => {
    // Ignore for the header row.
    if (li.classList.contains("item-header")) return;
    // Add draggable attribute and dragstart listener.
    li.setAttribute("draggable", true);
    li.addEventListener("dragstart", handler, false);
  });
}
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

/**
 * Handle clickable rolls.
 * @param {Event} event   The originating click event
 * @private
 */
_onRoll(event) {
  event.preventDefault();
  const element = event.currentTarget;
  const dataset = element.dataset;

  if (dataset.roll) {
    let roll = new Roll(dataset.roll, this.actor.data.data);
    let label = dataset.label ? `Rolling ${dataset.label}` : '';
    roll.roll().toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: label
    });
  }
}


}