// Returning CE saves predate the story ledger. Reconcile completed milestones
// once; future stories and NewsDoge thresholds keep their normal eligibility.
(function () {
    'use strict';
    const VERSION = 1;
    const PLANETS = ['earth','moon','mars','jupiter','titan'];
    const CATEGORIES = ['helpers','moonHelpers','marsHelpers','jupiterHelpers','titanHelpers'];
    const count = (save, category, type) => (save[category] || []).filter(h => h?.type === type).length;
    function prepare(save) {
        const revision = save.storyProgress?.completionHistoryVersion;
        if (revision != null && revision !== 0 && revision !== VERSION) throw new Error('This story-completion history version is not supported.');
        if (revision === VERSION) return { saveData: save, changed: false };
        const stories = window.DogeMinerStories;
        const next = stories.normalize(save.storyProgress, save.timelineNumber);
        const world = window.DogeMinerWorldDiscovery.normalize(save.worldDiscovery, save);
        const pending = new Set(next.pending), seen = new Set(next.seen), completed = new Set();
        const finish = (...ids) => { for (const id of ids) { seen.add(id); completed.add(id); } };
        const current = PLANETS.includes(save.currentLevel) ? save.currentLevel : 'earth';
        const visited = new Set([current, ...(save.worldDiscovery?.visited || [])]);
        for (const [i, planet] of PLANETS.entries()) {
            if ((save[CATEGORIES[i]] || []).length || (save.planetRockData?.[planet]?.rocksBroken || 0) > 0) visited.add(planet);
        }
        if ((save.timelineNumber || 1) === 1 && (save.cutscenes?.moonLaunch === true || save.hasPlayedMoonLaunch === true)) visited.add('moon');
        const oldUnlocks = new Set((save.unlockedLevels || []).filter(p => PLANETS.includes(p)));
        // Explicit older CE access is already earned, not a new discovery.
        if (!save.worldDiscovery) for (const planet of oldUnlocks) {
            if (planet === 'moon' && !visited.has('moon') && !count(save,'helpers','spaceRocket')) continue;
            if (!world.unlocked.includes(planet)) world.unlocked.push(planet);
            if (!world.known.includes(planet)) world.known.push(planet);
        }
        const reached = planet => visited.has(planet) || PLANETS.some((p,i) => i > PLANETS.indexOf(planet) && visited.has(p));
        const activeWork = planet => (save[CATEGORIES[PLANETS.indexOf(planet)]] || []).length > 0
            || (save.planetRockData?.[planet]?.rocksBroken || 0) > 0 || [...visited].some(p => PLANETS.indexOf(p) > PLANETS.indexOf(planet));
        const rocket = count(save,'helpers','spaceRocket') > 0;
        if (rocket || reached('moon') || (!pending.has('tothemoon') && count(save,'helpers','dogeKennels') > 0)) finish('tothemoon');
        for (const [planet,id] of [['moon','moon1'],['mars','mars1'],['jupiter','jupiter1']]) {
            if (reached(planet) && (!pending.has(id) || activeWork(planet))) finish(id);
        }
        const marsDone = reached('mars') || count(save,'moonHelpers','marsRocket') > 0;
        const jupiterDone = reached('jupiter') || count(save,'marsHelpers','jupiterRocket') > 0;
        for (const [planet,done,ids] of [['mars',marsDone,['marsunlock','moon3']],['jupiter',jupiterDone,['jupiterun','mars2','mars3']]]) {
            const route = world.routes[planet];
            if (done || (route.stage === 'ready' && !ids.some(id => pending.has(id)))) {
                route.stage = 'ready'; route.firstQueued = true; finish(...ids);
            }
        }
        for (const [planet,id,downstream] of [['moon','moon2',marsDone],['mars','marsdraw',jupiterDone]]) {
            const item = world.artifacts[planet];
            if (downstream || (item.stage === 'collected' && !pending.has(id))) {
                item.stage = 'collected'; item.readyAt = 0; finish(id);
            }
        }
        const rigOwned = count(save,'helpers','timeMachineRig') > 0;
        if (rigOwned || (world.events.rig.stage === 'ready' && !pending.has('timemachine'))) {
            world.events.rig.stage = 'ready'; finish('rigsunlock','timemachine');
        }
        const veteran = (save.timelineNumber || 1) > 1;
        if (save.diaMissionSeenOnce === true || veteran || (world.events.contacted && !pending.has('dia'))) {
            world.events.contacted = true; finish('dia');
        }
        const titanDone = reached('titan');
        const titanKnown = world.known.includes('titan') || oldUnlocks.has('titan');
        for (const [key,id,marker] of [['titanSensor','titan1','findtit'],['titanRoute','titan2','unltitan']]) {
            if (titanDone || (titanKnown && !pending.has(id) && (world.events[key].stage === 'ready' || oldUnlocks.has('titan')))) {
                world.events[key].stage = 'ready'; finish(marker,id);
            }
        }
        if (save.bonusCoinClaimCount > 0 || save.bonusCoinBuffMultiplier > 1) {
            if (!pending.has('bonus') || save.bonusCoinClaimCount > 1 || !(save.bonusCoinBuffEndTime > Date.now())) finish('bonus');
        }
        if (seen.has('hitsng') || save.hitsng === true) finish('hitsng','hitsong');
        // A return dialog is still relevant at a saved, untouched return. Once
        // this run has progressed, replaying it would interrupt an old game.
        const returnId = stories.timelineReturnId(save.timelineNumber || 1);
        const runStarted = current !== 'earth' || CATEGORIES.some(key => (save[key] || []).length)
            || save.dogecoins > 0 || (save.planetRockData?.earth?.rocksBroken || 0) > 0;
        if (returnId && (!pending.has(returnId) || runStarted)) finish(returnId);
        const news = window.DogeMinerNewsDoge;
        if (news) {
            const highest = Math.max(1,...[...visited].map(p => PLANETS.indexOf(p)+1));
            const earned = save.timelineProgress?.current?.earnedCoins ?? (veteran ? save.dogecoins : save.totalMined) ?? 0;
            const played = (save.timelineProgress?.current?.playTimeMs ?? (veteran ? 0 : (save.statistics?.totalPlayTime || 0)*1000))/1000;
            const snapshot = DogeMinerGame.prototype.getNewsDogeSnapshot.call({...save,
                getCurrentTimelineStats:() => ({earnedCoins:earned,playTimeMs:played*1000})});
            const counts = snapshot.counts;
            for (let level=1;level<=highest;level++) {
                for (const id of news.eligibleIds({level,maxlevel:level,timeline:save.timelineNumber||1,
                    alltimecoins:earned,timeplayed:played,locationMs:visited.has(PLANETS[level-1])?10000:0,counts})) finish(id);
            }
            for (const id of news.eligibleIds({level:3,maxlevel:highest,timeline:save.timelineNumber||1,
                alltimecoins:earned,timeplayed:played,locationMs:0,counts})) finish(id);
        }
        next.seen = [...seen]; next.pending = next.pending.filter(id => !completed.has(id));
        next.completionHistoryVersion = VERSION;
        return { saveData: {...save,storyProgress:next,worldDiscovery:world}, changed:true,
            completedIds:[...completed], retiredPending:save.storyProgress?.pending?.filter(id => completed.has(id)) || [] };
    }
    window.DogeMinerStoryHistory = Object.freeze({VERSION,prepare});
})();
