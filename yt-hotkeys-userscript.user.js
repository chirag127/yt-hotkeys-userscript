// ==UserScript==
// @name         YT Hotkeys
// @namespace    https://github.com/chirag127
// @version      3.1.1
// @description  Six rebindable YouTube shortcuts. One "Settings…" menu entry opens a popup. The only script in the collection that binds a keydown listener.
// @author       chirag127
// @license      MIT
// @match        https://www.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @homepageURL  https://github.com/chirag127/yt-hotkeys-userscript
// @supportURL   https://github.com/chirag127/yt-hotkeys-userscript/issues
// @downloadURL  https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js
// @updateURL    https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js
// @require      https://raw.githubusercontent.com/chirag127/yt-core-lib/main/yt-core-lib-1.2.0.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      *
// @noframes
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  if (typeof Ytk === 'undefined') {
    console.error('[hotkeys] yt-core-lib did not load — @require failed.');
    return;
  }

  var ACTIONS = [
    { id: 'like', key: 'hkLike', label: 'Like', def: 'a' },
    { id: 'dislike', key: 'hkDislike', label: 'Dislike', def: 'd' },
    { id: 'next', key: 'hkNext', label: 'Next video', def: 'n', repeatable: true },
    { id: 'prev', key: 'hkPrev', label: 'Previous video', def: 'p', repeatable: true },
    { id: 'likeNext', key: 'hkLikeNext', label: 'Like + next', def: 'shift+a' },
    { id: 'dislikeNext', key: 'hkDislikeNext', label: 'Dislike + next', def: 'shift+d' }
  ];

  var DEAD = ['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'Dead', 'Unidentified'];

  function comboFromEvent(e) {
    if (e.isComposing || !e.key || DEAD.indexOf(e.key) !== -1) return null;
    var mods = [];
    if (e.ctrlKey) mods.push('ctrl');
    if (e.altKey) mods.push('alt');
    if (e.shiftKey) mods.push('shift');
    if (e.metaKey) mods.push('meta');
    return mods.concat(e.key.toLowerCase()).join('+');
  }

  function bindings() {
    var s = Ytk.settings();
    var out = {};
    for (var i = 0; i < ACTIONS.length; i++) {
      out[ACTIONS[i].id] = s[ACTIONS[i].key] || ACTIONS[i].def;
    }
    return out;
  }

  function isTyping(node) {
    if (!node || !node.tagName) return false;
    var tag = node.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (node.isContentEditable) return true;
    if (node.getAttribute && node.getAttribute('contenteditable') === 'true') return true;
    if (node.closest && node.closest('#contenteditable-root, ytd-commentbox')) return true;
    return false;
  }

  function clickFirst(selectors) {
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el && !el.disabled && el.getAttribute('aria-disabled') !== 'true') { el.click(); return true; }
    }
    return false;
  }

  var CLICKS = {
    like: ['like-button-view-model button', '#segmented-like-button button'],
    dislike: ['dislike-button-view-model button', '#segmented-dislike-button button'],
    next: ['.ytp-next-button'],
    prev: ['.ytp-prev-button']
  };

  function run(id) {
    if (id === 'likeNext') { clickFirst(CLICKS.like); setTimeout(function () { clickFirst(CLICKS.next); }, 350); return true; }
    if (id === 'dislikeNext') { clickFirst(CLICKS.dislike); setTimeout(function () { clickFirst(CLICKS.next); }, 350); return true; }
    return clickFirst(CLICKS[id] || []);
  }

  function onKeyDown(e) {
    if (e.defaultPrevented) return;
    var cfgS = Ytk.settings();
    if (cfgS.hotkeyBlockTyping !== false && (isTyping(e.target) || isTyping(document.activeElement))) return;
    var combo = comboFromEvent(e);
    if (!combo) return;
    var map = bindings();
    for (var i = 0; i < ACTIONS.length; i++) {
      var action = ACTIONS[i];
      if (map[action.id] !== combo) continue;
      var canRepeat = action.repeatable && cfgS.hotkeyRepeatSeek !== false;
      if (e.repeat && !canRepeat) { e.preventDefault(); return; }
      e.preventDefault();
      var ok = false;
      try { ok = run(action.id); } catch (err) { ok = false; }
      if (Ytk.settings().hotkeyFeedback) Ytk.toast(action.label + (ok ? '' : ' — not available'));
      return;
    }
  }

  var boot = {
    core: Ytk.VERSION,
    bindings: bindings(),
    enabled: Ytk.featureOn('hotkeys', true)
  };
  try { localStorage.setItem('ytk.hotkeys.boot', JSON.stringify(boot)); } catch (e) { /* ignore */ }

  if (!boot.enabled) return;

  document.addEventListener('keydown', onKeyDown, true);

  // Deep link: any YouTube URL with #ytk-settings opens the settings popup.
  if (location.hash === '#ytk-settings') setTimeout(settingsPopup, 400);

  // ---------------------------------------------------------------- the ONE menu entry

  function settingsPopup() {
    if (typeof Ytk.openSettings !== 'function') {
      alert('The shared core is out of date (v' + Ytk.VERSION + '). Reinstall this script so its @require is re-fetched.');
      return;
    }
    var fields = ACTIONS.map(function (a) {
      return { key: a.key, label: a.label, type: 'key', def: a.def };
    });
    fields.push({
      key: 'hotkeyFeedback',
      label: 'Show a small toast when a shortcut fires',
      type: 'checkbox',
      def: false
    });
    fields.push({ key: 'hotkeys', label: 'Enable these shortcuts', type: 'checkbox', def: true });
    fields.push({ key: 'hotkeyBlockTyping', label: 'Never fire while typing in a box', type: 'checkbox', def: true, hint: 'Strongly recommended. Turning this off makes the keys fire inside search and comment boxes.' });
    fields.push({ key: 'hotkeyRepeatSeek', label: 'Let a held key repeat for next / previous', type: 'checkbox', def: true });

    Ytk.openSettings({
      actions: [
        { label: 'Reset all keys to defaults', run: function () {
            var patch = {};
            ACTIONS.forEach(function (a) { patch[a.key] = a.def; });
            Ytk.saveSettings(patch);
            Ytk.toast('Keys reset to defaults');
          } },
        { label: 'Test: flash the feedback toast', run: function () { Ytk.toast('Hotkeys are working'); } }
      ],
      title: 'YT Hotkeys',
      subtitle: 'Click Rebind, then press the key you want. YouTube already uses j k l f m c t i, digits, arrows, space and Shift+n / Shift+p.',
      sectionTitle: 'Shortcuts',
      fields: fields
    });
  }

  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('Settings…', settingsPopup);
  }
})();
