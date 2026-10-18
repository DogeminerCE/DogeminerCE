// Shared panel-relative placement and short popup transitions. Presentation only:
// callers still own acknowledgment, save transactions and gameplay effects.
(function () {
    'use strict';
    const specs = [
        ['.beta-balance-overlay', '.beta-balance-panel', 'dynamic'],
        ['.switcher-modal', '.switcher-modal-content', 'card'],
        ['.dia-mission-modal', '.dia-mission-card', 'card'],
        ['.dia-warning-modal', '.dia-warning-card', 'card'],
        ['.controller-dialog-overlay', '.controller-dialog-box', 'card'],
        ['#dogebag-modal', '.dogebag-scene', 'frame'],
        ['#mission-passed', '.popup-reward-stage', 'dynamic-frame']
    ];
    const selector = specs.map(spec => spec[0]).join(',');
    const records = new Map();
    const closing = new Map();
    let scheduled = false;

    function panelBounds() {
        const viewport = window.visualViewport;
        const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
        const right = left + (viewport?.width || innerWidth), bottom = top + (viewport?.height || innerHeight);
        const panels = ['left-panel', 'right-panel'].map(id => document.getElementById(id))
            .filter(node => node && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden')
            .map(node => node.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0);
        const x = Math.max(left, panels.length ? Math.min(...panels.map(rect => rect.left)) : left);
        const y = Math.max(top, panels.length ? Math.min(...panels.map(rect => rect.top)) : top);
        const endX = Math.min(right, panels.length ? Math.max(...panels.map(rect => rect.right)) : right);
        const endY = Math.min(bottom, panels.length ? Math.max(...panels.map(rect => rect.bottom)) : bottom);
        return { left: x, top: y, width: Math.max(1, endX - x), height: Math.max(1, endY - y) };
    }
    function layout(record) {
        const { root, content, mode } = record;
        if (!root.isConnected || !root.getClientRects().length) return;
        const bounds = panelBounds(), origin = root.getBoundingClientRect();
        const sx = origin.width / root.offsetWidth || 1, sy = origin.height / root.offsetHeight || 1;
        const frame = mode.includes('frame');
        const width = bounds.width / sx, height = bounds.height / sy;
        const backdrop = root.querySelector('.dogebag-backdrop');
        if (backdrop) Object.assign(backdrop.style, {
            left: `${(bounds.left - origin.left) / sx}px`, top: `${(bounds.top - origin.top) / sy}px`,
            width: `${width}px`, height: `${height}px`
        });
        const style = content.style;
        style.setProperty('position', 'absolute', 'important');
        style.setProperty('margin', '0', 'important');
        style.boxSizing = 'border-box';
        style.left = `${(bounds.left - origin.left + (frame ? 0 : bounds.width / 2)) / sx}px`;
        style.top = `${(bounds.top - origin.top + (frame ? 0 : bounds.height / 2)) / sy}px`;
        style.translate = frame ? 'none' : '-50% -50%';
        style.setProperty('transform', 'none', 'important');
        style.setProperty('transform-origin', 'center', 'important');
        style.setProperty('animation', 'none', 'important');
        style.setProperty('transition', 'none', 'important');
        style.setProperty('--beta-viewport-height', `${height}px`);
        style.setProperty('max-width', `${Math.max(1, width - (frame ? 0 : 32))}px`, 'important');
        style.setProperty('max-height', `${Math.max(1, height - (frame ? 0 : 56))}px`, 'important');
        if (frame) { style.width = `${width}px`; style.height = `${height}px`; }
        else { style.minHeight = '0'; if (!root.matches('.beta-balance-overlay')) style.overflowY = 'auto'; }
        const skip = root.querySelector('#dia-skip-btn');
        if (skip) {
            skip.style.setProperty('left', style.left, 'important');
            skip.style.setProperty('top', `${Math.max((bounds.top - origin.top) / sy + 4,
                parseFloat(style.top) - content.offsetHeight / 2 - 40)}px`, 'important');
        }
    }
    function cancel(record) {
        record.animation?.cancel(); record.animation = null;
    }
    function transition(record, entering, done) {
        const style = getComputedStyle(record.content);
        const from = { scale: style.scale === 'none' ? '1' : style.scale, opacity: style.opacity };
        const interrupted = !!record.animation;
        cancel(record);
        // Keep the requested open/close cue visible in both preference modes.
        // Reduced motion uses a smaller zoom and a shorter, still eased fade.
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const duration = reduced ? 160 : entering ? 280 : 200;
        const endScale = reduced ? '.96' : '.8';
        const animation = record.content.animate([
            entering && !interrupted ? { scale: endScale, opacity: 0 } : from,
            { scale: entering ? '1' : endScale, opacity: entering ? 1 : 0 }
        ], { duration, easing: entering ? 'cubic-bezier(.22,.7,.25,1)' : 'cubic-bezier(.4,0,.8,.3)', fill: 'both' });
        record.animation = animation;
        animation.onfinish = () => {
            if (record.animation !== animation) return;
            record.animation = null;
            record.content.style.scale = entering ? '1' : endScale;
            record.content.style.opacity = entering ? '1' : '0';
            animation.cancel(); done?.();
        };
    }
    function sync(record) {
        if (closing.has(record.root)) return;
        const dynamic = record.mode.startsWith('dynamic');
        const open = dynamic || (record.root.classList.contains('active') && !record.root.classList.contains('closing'));
        if (open === record.open) { if (open) layout(record); return; }
        record.open = open;
        if (open) {
            record.root.classList.remove('popup-exiting');
            if (record.exiting) { record.content.inert = record.previousInert; record.exiting = false; }
            layout(record); transition(record, true);
        } else {
            // Dialog focus guards save/restore body-child inert states. Keep
            // this short-lived exit guard on the card so those snapshots cannot
            // retain an obsolete inert state on a later-opened dialog root.
            record.previousInert = record.content.inert;
            record.content.inert = true; record.exiting = true;
            record.root.classList.add('popup-exiting');
            transition(record, false, () => {
                record.root.classList.remove('popup-exiting');
                record.content.inert = record.previousInert; record.exiting = false;
            });
        }
    }
    function mount(root) {
        if (records.has(root)) return records.get(root);
        const spec = specs.find(spec => root.matches(spec[0]));
        if (!spec) return null;
        if (spec[2] === 'dynamic-frame' && !root.querySelector(spec[1])) {
            const stage = document.createElement('div');stage.className = 'popup-reward-stage';
            stage.append(...root.childNodes);root.append(stage);
        }
        const content = root.querySelector(spec[1]);
        if (!content) return null;
        const record = { root, content, mode: spec[2], open: false };
        records.set(root, record);root.classList.add('popup-managed');
        // Disable the old whole-overlay controller zoom; only the card moves.
        root.style.setProperty('animation', 'none', 'important');
        content.style.opacity = '1';content.style.scale = '1';
        sync(record);return record;
    }
    function remove(root) {
        const record = records.get(root);
        if (record) cancel(record);
        closing.get(root)?.cancel();closing.delete(root);records.delete(root);root.remove();
    }
    function close(root) {
        const record = mount(root);
        if (!record) { root.remove();return; }
        if (closing.has(root)) return;
        root.inert = true;root.setAttribute('aria-hidden', 'true');root.style.pointerEvents = 'none';
        // Keep the backdrop alive during the card's exit, then remove both.
        const backdrop = root.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 160 : 200, fill: 'both'
        });
        closing.set(root, backdrop);transition(record, false, () => remove(root));
    }
    function finishClosing() { for (const root of [...closing.keys()]) remove(root); }
    function refresh() {
        if (scheduled) return;
        scheduled = true;requestAnimationFrame(() => {
            scheduled = false;
            for (const [root, record] of records) {
                if (!root.isConnected) { cancel(record);closing.get(root)?.cancel();closing.delete(root);records.delete(root); }
                else if (record.open) layout(record);
            }
        });
    }
    function scan(node) {
        if (node.nodeType !== 1) return;
        if (node.matches(selector)) mount(node);
        for (const root of node.querySelectorAll(selector)) mount(root);
    }
    scan(document.documentElement);
    new MutationObserver(changes => {
        for (const change of changes) {
            if (change.type === 'attributes') {
                const record = records.get(change.target);
                if (record) sync(record);
            } else {
                for (const node of change.addedNodes) scan(node);
                if (change.removedNodes.length) refresh();
            }
        }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    const resize = new ResizeObserver(refresh);
    for (const id of ['left-panel', 'right-panel', 'game-container']) {
        const node = document.getElementById(id);if (node) resize.observe(node);
    }
    window.addEventListener('resize', refresh);window.addEventListener('scroll', refresh, { passive: true });
    window.visualViewport?.addEventListener('resize', refresh);window.visualViewport?.addEventListener('scroll', refresh);
    window.PopupPresentation = Object.freeze({ mount, close, remove, finishClosing, refresh, panelBounds });
})();
