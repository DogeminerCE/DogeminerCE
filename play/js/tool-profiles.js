// Active item metadata from the pinned DM2 catalog; dormant tween branches stay inactive.
(function () {
    'use strict';
    const profiles = Object.freeze({
  "1": {
    "sprite": "standard",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "2": {
    "sprite": "stronger",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "3": {
    "sprite": "golden",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "4": {
    "sprite": "tarpis",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "5": {
    "sprite": "gpu",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "6": {
    "sprite": "gpurocket",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "7": {
    "sprite": "lollipaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "8": {
    "sprite": "cod",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "9": {
    "sprite": "rocket",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "10": {
    "sprite": "blueglowstick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "11": {
    "sprite": "greenglowstick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "12": {
    "sprite": "partypickaxe",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "13": {
    "sprite": "felps",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "ancient": {
    "sprite": "ancientaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "axe": {
    "sprite": "axe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "barbell": {
    "sprite": "barbell_empty",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "barbell2": {
    "sprite": "barbell_halfweights",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "barbell3": {
    "sprite": "barbell_weights",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "basket": {
    "sprite": "basketpickaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "batwand": {
    "sprite": "wand_bat",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bigaxe": {
    "sprite": "bigaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bigaxe2": {
    "sprite": "bigaxe2",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bigboot": {
    "sprite": "bigboot",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bighammer": {
    "sprite": "bighammer",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bighammer2": {
    "sprite": "bighammer2",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "blue": {
    "sprite": "bluepick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bone": {
    "sprite": "boneaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bonegreen": {
    "sprite": "boneaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bronze": {
    "sprite": "yellowbronze",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "broom": {
    "sprite": "witchbroom",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "bunny": {
    "sprite": "bunnypickaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "cactus": {
    "sprite": "cactus",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "candlepick": {
    "sprite": "candlepick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "carbine": {
    "sprite": "m4",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": [
      "pew1",
      "pew2",
      "pew3",
      "pew4",
      "pew1"
    ],
    "critsound": {
      "rate": 0.85,
      "sounds": [
        "pew1",
        "pew2",
        "pew3",
        "pew4"
      ],
      "vol": 0.2
    }
  },
  "cleaver": {
    "sprite": "cleaver",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "cleavergold": {
    "sprite": "cleavergold",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "cloud": {
    "sprite": "hardenedcloud",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "coin": {
    "sprite": "brokencoin",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "cruderocket": {
    "sprite": "cruderocket",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "dagger": {
    "sprite": "dagger",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "diamondsword": {
    "sprite": "diasword",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "drill": {
    "sprite": "hugedrill",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "eguitar": {
    "sprite": "eguitar",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "fireaxe": {
    "sprite": "fireaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "fireaxegold": {
    "sprite": "fireaxegold",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "fryingpan": {
    "sprite": "fryingpan",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "goldenbone": {
    "sprite": "goldenbone",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "goldendrill": {
    "sprite": "goldendrill",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "goldenhammer": {
    "sprite": "goldenhammer",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "goldenrecord": {
    "sprite": "goldenrecord",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "goldensmall": {
    "sprite": "yellowbronze",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "goldsword": {
    "sprite": "goldsword",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "islandstatue": {
    "sprite": "islandstatue",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "knife": {
    "sprite": "knife",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "lightaxe": {
    "sprite": "lightaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": [
      "lasersword1",
      "lasersword2",
      "lasersword1",
      "lasersword2"
    ],
    "critsound": null
  },
  "lolligreen": {
    "sprite": "lollipaxe_green",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "lollired": {
    "sprite": "lollipaxe_red",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "lucky": {
    "sprite": "stronger",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "luckygold": {
    "sprite": "golden",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "magma": {
    "sprite": "magmastick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "martian": {
    "sprite": "marspick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "modern": {
    "sprite": "modernaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "moonrock": {
    "sprite": "moonrock",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "nitrorocketaxe": {
    "sprite": "rocketaxe",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "nuke": {
    "sprite": "nuke",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "paw": {
    "sprite": "paw",
    "extrasprite": false,
    "behind": true,
    "noidle": true,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "pinkcane": {
    "sprite": "pinkcane",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "poolnoodle": {
    "sprite": "poolnoodle",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "record": {
    "sprite": "record",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "redcane": {
    "sprite": "redcane",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "rick": {
    "sprite": "pickaxerick",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "rocketaxe": {
    "sprite": "rocketaxe",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "saw": {
    "sprite": "sawaxe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "saw2": {
    "sprite": "sawaxe2",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "saw3": {
    "sprite": "sawaxe3",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "sharpaxe": {
    "sprite": "axe",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "shotgun": {
    "sprite": "shotgun",
    "extrasprite": true,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": [
      "pew1",
      "pew2",
      "pew3",
      "pew4",
      "pew1"
    ],
    "critsound": {
      "rate": 0.85,
      "sounds": [
        "pew1",
        "pew2",
        "pew3",
        "pew4"
      ],
      "vol": 0.2
    }
  },
  "sli": {
    "sprite": "sligpu",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "slioc": {
    "sprite": "sligpu_oc",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "smalldrill": {
    "sprite": "smalldrill",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "smelly": {
    "sprite": "greenglowstick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "staff": {
    "sprite": "magicstaff",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "staffascended": {
    "sprite": "magicstaff",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "sticks": {
    "sprite": "sticks",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "sticky": {
    "sprite": "blueglowstick",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "sunscepter": {
    "sprite": "sunscepter",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "supersword": {
    "sprite": "supersword",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "usedrocket": {
    "sprite": "usedrocket",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "wand": {
    "sprite": "wand",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  },
  "xmastree": {
    "sprite": "xmastree",
    "extrasprite": false,
    "behind": false,
    "noidle": false,
    "tween": null,
    "hitsound": null,
    "critsound": null
  }
});
    const proto = DogeMinerGame.prototype, tools = window.DogeMinerTools;
    function profile(item) { return profiles[tools.id(item)] || {extrasprite:false,behind:false,noidle:false,tween:null}; }
    proto.applyToolMetadata = function () {
        const item = this.getEquippedPickaxe(), phone = this.isMobileDevice?.() === true;
        const key = `${item?.instanceId}:${phone}:${this._toolRigKey}`;
        if (key === this._toolMetadataKey) return;
        this._toolMetadataKey = key;
        const meta = profile(item);
        for (const id of ['pickaxe','pickaxe-offhand']) {
            const node = document.getElementById(id); if (!node) continue;
            node.dataset.toolType = tools.id(item) || '';
            node.classList.toggle('tool-behind',meta.behind);
            node.classList.toggle('tool-noidle',meta.noidle);
            node.classList.toggle('tool-phone-staff',phone && ['staff','staffascended'].includes(tools.id(item)));
            node.classList.toggle('tool-phone-pair',phone && this.isDualWielding() && !['staff','staffascended'].includes(tools.id(item)));

            if (meta.noidle) node.classList.remove('pickaxe-intro');
        }
    };
    const sync = proto.syncToolRig;
    proto.syncToolRig = function (...args) { const result = sync.apply(this,args); this.applyToolMetadata(); return result; };
    const reset = proto.resetToolPresentation;
    proto.resetToolPresentation = function (...args) {
        for (const timer of this._toolTextureTimers?.values() || []) clearTimeout(timer);
        this._toolTextureTimers = new Map(); return reset.apply(this,args);
    };
    proto.showActivePickaxeSprite = function () {
        const item = this.getEquippedPickaxe(), meta = profile(item);
        if (!meta.extrasprite && !this._activeSpritePaths?.has(item?.templateId)) return;
        this._toolTextureTimers ||= new Map();
        const epoch = this._toolEpoch;
        for (const hand of this._toolAttackHands || ['pickaxe']) {
            const node = document.getElementById(hand); if (!node) continue;
            clearTimeout(this._toolTextureTimers.get(hand));
            node.src = item.idleSprite.replace(/\.webp$/, '-use.webp');
            this._toolTextureTimers.set(hand,setTimeout(()=>{
                if (this._toolEpoch === epoch && this.getEquippedPickaxe() === item && node.isConnected) node.src = item.idleSprite;
                this._toolTextureTimers.delete(hand);
            },175));
        }
    };
    window.DogeMinerToolProfiles = Object.freeze({profiles,profile});
})();
