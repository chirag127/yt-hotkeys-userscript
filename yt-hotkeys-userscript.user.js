// ==UserScript==
// @name         YT Hotkeys
// @namespace    https://github.com/chirag127
// @version      2.1.2
// @description  Six rebindable YouTube shortcuts (like, dislike, next, previous, like+next, dislike+next). Draws nothing and never fights another script for the keyboard.
// @author       chirag127
// @license      MIT
// @match        https://www.youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @homepageURL  https://github.com/chirag127/yt-hotkeys-userscript
// @supportURL   https://github.com/chirag127/yt-hotkeys-userscript/issues
// @downloadURL  https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js
// @updateURL    https://github.com/chirag127/yt-hotkeys-userscript/raw/main/yt-hotkeys-userscript.user.js
// @require      https://raw.githubusercontent.com/chirag127/yt-core-lib/main/yt-core-lib.js?v=1.1.1
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @noframes
// @run-at       document-idle
// ==/UserScript==

/*
 * THE ONLY script in this collection that binds a keydown listener. If another script
 * ever needs a shortcut, it must add it here — two scripts binding the same key is the
 * failure mode this repo exists to prevent.
 */

(function () {
  'use strict';

  if (typeof Ytk === 'undefined') {
    console.error('[hotkeys] yt-core-lib did not load — @require failed.');
    return;
  }
  if (!Ytk.featureOn('hotkeys', true)) return;

  var ACTIONS = [
    { id: 'like', label: 'Like', def: 'a' },
    { id: 'dislike', label: 'Dislike', def: 'd' },
    { id: 'next', label: 'Next video', def: 'n', repeatable: true },
    { id: 'prev', label: 'Previous video', def: 'p', repeatable: true },
    { id: 'likeNext', label: 'Like + next', def: 'shift+a' },
    { id: 'dislikeNext', label: 'Dislike + next', def: 'shift+d' }
  ];

  var MODS = ['ctrl', 'alt', 'shift', 'meta'];
  var DEAD = ['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock', 'Dead', 'Unidentified'];

  function bindings() {
    var saved = Ytk.storeGet('hotkeys', {}) || {};
    var out = {};
    for (var i = 0; i < ACTIONS.length; i++) {
      out[ACTIONS[i].id] = normalize(saved[ACTIONS[i].id]) || ACTIONS[i].def;
    }
    return out;
  }

  function normalize(value) {
    if (!value || typeof value !== 'string') return null;
    var parts = value.split('+').map(function (p) { return p.trim().toLowerCase(); }).filter(Boolean);
    if (!parts.length) return null;
    var key = parts.pop();
    if (!key) return null;
    var mods = [];
    for (var i = 0; i < MODS.length; i++) if (parts.indexOf(MODS[i]) !== -1) mods.push(MODS[i]);
    return mods.concat(key).join('+');
  }

  function comboFromEvent(e) {
    if (e.isComposing) return null;
    if (DEAD.indexOf(e.key) !== -1) return null;
    if (!e.key) return null;
    var mods = [];
    if (e.ctrlKey) mods.push('ctrl');
    if (e.altKey) mods.push('alt');
    if (e.shiftKey) mods.push('shift');
    if (e.metaKey) mods.push('meta');
    return mods.concat(e.key.toLowerCase()).join('+');
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
      if (el && !el.disabled && el.getAttribute('aria-disabled') !== 'true') {
        el.click();
        return true;
      }
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
    if (isTyping(e.target) || isTyping(document.activeElement)) return;
    var combo = comboFromEvent(e);
    if (!combo) return;
    var map = bindings();
    for (var i = 0; i < ACTIONS.length; i++) {
      var action = ACTIONS[i];
      if (map[action.id] !== combo) continue;
      if (e.repeat && !action.repeatable) { e.preventDefault(); return; }
      e.preventDefault();
      var ok = false;
      try { ok = run(action.id); } catch (err) { ok = false; }
      if (Ytk.settings().hotkeyFeedback) Ytk.toast(action.label + (ok ? '' : ' — not available'));
      return;
    }
  }

  try { localStorage.setItem('ytk.hotkeys.boot', JSON.stringify({ at: Date.now(), core: Ytk.VERSION, bindings: bindings() })); } catch (e) {}

  document.addEventListener('keydown', onKeyDown, true);

  // ---------------------------------------------------------------- menu

  function rebind(id) {
    var action = null;
    for (var i = 0; i < ACTIONS.length; i++) if (ACTIONS[i].id === id) action = ACTIONS[i];
    if (!action) return;
    var map = bindings();
    var entered = prompt('New key for "' + action.label + '"\n\nCurrent: ' + map[id]
      + '\n\nType a key or combo: a, shift+a, ctrl+arrowright.\nLeave empty to keep current.', map[id]);
    if (entered === null) return;
    var combo = normalize(entered);
    if (!combo) { alert('That is not a usable key. Nothing changed.'); return; }
    for (var j = 0; j < ACTIONS.length; j++) {
      if (ACTIONS[j].id !== id && map[ACTIONS[j].id] === combo) {
        alert('Conflict: "' + combo + '" is already "' + ACTIONS[j].label + '". Nothing changed.');
        return;
      }
    }
    map[id] = combo;
    Ytk.storeSet('hotkeys', map);
    alert('"' + action.label + '" is now ' + combo + '.');
  }

  function resetAll() {
    if (!confirm('Reset all six shortcuts to their defaults?')) return;
    var map = {};
    for (var i = 0; i < ACTIONS.length; i++) map[ACTIONS[i].id] = ACTIONS[i].def;
    Ytk.storeSet('hotkeys', map);
    alert('Hotkeys reset to defaults.');
  }

  function toggleFeedback() {
    var s = Ytk.settings();
    Ytk.saveSettings({ hotkeyFeedback: !s.hotkeyFeedback });
    alert('Hotkey feedback toast: ' + (!s.hotkeyFeedback ? 'ON' : 'OFF'));
  }

  function showAll() {
    var map = bindings();
    var lines = ['YT Hotkeys — active bindings', ''];
    for (var i = 0; i < ACTIONS.length; i++) lines.push('  ' + ACTIONS[i].label + ' = ' + map[ACTIONS[i].id]);
    lines.push('');
    lines.push('YouTube already uses j k l f m c t i, digits, arrows, space, < > , . and Shift+N / Shift+P.');
    alert(lines.join('\n'));
  }

  if (typeof GM_registerMenuCommand === 'function') {
    for (var i = 0; i < ACTIONS.length; i++) {
      (function (action) {
        GM_registerMenuCommand('Rebind ' + action.label + '…', function () { rebind(action.id); });
      })(ACTIONS[i]);
    }
    GM_registerMenuCommand('Hotkeys: reset to defaults', resetAll);
    GM_registerMenuCommand('Hotkeys: show all', showAll);
    GM_registerMenuCommand('Hotkeys: toggle feedback toast', toggleFeedback);
  }
})();
