// Kenney Cursor Pack 1.1 Outline (CC0). Shared native mouse and virtual controller states.
(function () {
    'use strict';
    const assets = {
        default: ['pointer_b.png', 10, 8],
        pointer: ['hand_small_point.png', 13, 7],
        grab: ['hand_small_open.png', 16, 15],
        grabbing: ['hand_small_closed.png', 16, 15],
        disabled: ['cursor_disabled.png', 10, 8]
    };
    const paths = Object.fromEntries(Object.entries(assets).map(([key, [file]]) => [key, `assets/cursors/kenney/outline/${file}`]));
    let target = null, virtualHelper = null, controller = null;
    let pressed = false;
    function stateFor(game, element) {
        if (game?._helperDrag || game?.isDraggingRick || game?.helpersOnCursor?.length) return 'grabbing';
        if (element?.closest?.('.placed-helper, .rick-doge.ready-to-grab')) return 'grab';
        if (element?.closest?.('button:disabled, [aria-disabled="true"]')) return 'disabled';
        if (element?.closest?.('button, a, summary, label, .coin-pile, .dogebag-drop, .diamond-drop, [role="button"]')) return 'pointer';
        return 'default';
    }
    function paintVirtual(game, element) {
        if (!controller?.vcElement) return;
        const state = pressed && stateFor(game, element) === 'grab' ? 'grabbing' : stateFor(game, element);
        if (controller.vcElement.getAttribute?.('src') !== paths[state]) controller.vcElement.src = paths[state];
        controller.vcElement.style.transformOrigin = `${assets[state][1]}px ${assets[state][2]}px`;
        controller.vcElement.style.left = `${controller.vcX - assets[state][1]}px`;
        controller.vcElement.style.top = `${controller.vcY - assets[state][2]}px`;
    }
    function refresh(game = window.game, element = target) {
        const state = pressed && stateFor(game, element) === 'grab' ? 'grabbing' : stateFor(game, element);
        if (document.body.dataset.cursorState !== state) document.body.dataset.cursorState = state;
        paintVirtual(game, element);
    }
    function setPressed(value) {
        pressed = value;
        for (const element of [controller?.vcElement]) {
            if (!element) continue;
            element.getAnimations?.().forEach(animation => animation.cancel());
            if (value) element.animate?.([{transform:'scale(1)'},{transform:'scale(.86)'}], {duration:80,fill:'forwards',easing:'ease-out'});
            else element.animate?.([{transform:'scale(.86)'},{transform:'scale(1.08)'},{transform:'scale(1)'}], {duration:220,easing:'ease-out'});
        }
        refresh();
    }
    window.GameCursor = {
        paths, assets, stateFor, refresh, setPressed,
        updateVirtualCursor(manager, game) {
            controller = manager;
            const element = document.elementFromPoint(manager.vcX, manager.vcY);
            const helper = element?.closest?.('.placed-helper, .helper-group-action, .dogebag-stack, .coin-pile');
            if (helper !== virtualHelper) {
                virtualHelper?.dispatchEvent(new MouseEvent('mouseleave', {clientX: manager.vcX, clientY: manager.vcY}));
                virtualHelper = helper;
                helper?.dispatchEvent(new MouseEvent('mouseenter', {clientX: manager.vcX, clientY: manager.vcY}));
            }
            if (helper?._lootHover) helper.dispatchEvent(new MouseEvent('mousemove', {clientX: manager.vcX, clientY: manager.vcY}));
            target = element;
            refresh(game, element);
        }
    };
    // Native tracking is independent of page rendering and display refresh.
    document.addEventListener('mousemove', event => {
        if (event.target === target) return;
        target = event.target;
        refresh();
    }, {passive: true});
    document.addEventListener('mousedown', event => {if (event.button === 0) setPressed(true);}, true);
    document.addEventListener('mouseup', () => {setPressed(false); setTimeout(() => refresh(), 0);}, true);
    window.addEventListener?.('blur', () => setPressed(false));
})();
