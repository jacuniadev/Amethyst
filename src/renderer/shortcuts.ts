import { amethyst, useState } from "@/amethyst";
import { onKeyStroke, useKeyModifier, UseKeyModifierReturn, useLocalStorage } from "@vueuse/core";

export type ShortcutBindings = Record<string, [string[], (e: KeyboardEvent) => void]>;
export type CustomShortcutBindings = Record<string, string[]>;

export class Shortcuts {
  public isControlPressed = useKeyModifier("Control") as UseKeyModifierReturn<boolean>;
  public isShiftPressed = useKeyModifier("Shift") as UseKeyModifierReturn<boolean>;
  public isAltPressed = useKeyModifier("Alt") as UseKeyModifierReturn<boolean>;

  // TODO: somehow link this logic to each function in the components so they render automatically in dropdown menus
  public DEFAULT_BINDINGS: ShortcutBindings = {
    "audio.play.pause": [[" "], () => amethyst.player.isPlaying.value ? amethyst.player.pause() : amethyst.player.play()],
    "audio.next": [["ArrowDown"], () => amethyst.player.skip()],
    "audio.previous": [["ArrowUp"], () => amethyst.player.previous()],
    "audio.seek.forward": [["ArrowRight"], () => amethyst.player.seekForward()],
    "audio.seek.backward": [["ArrowLeft"], () => amethyst.player.seekBackward()],
    "audio.volume.up": [["PageUp"], () => amethyst.player.volumeUp()],
    "audio.volume.down": [["PageDown"], () => amethyst.player.volumeDown()],
    "queue.add.file": [["o"], () => this.isControlPressed.value && amethyst.openAudioFilesAndAddToQueue()],
    "queue.add.folder": [["O"], () => this.isControlPressed.value && amethyst.openAudioFoldersAndAddToQueue()],
    "queue.clear": [["X"], () => this.isControlPressed.value && amethyst.player.queue.clear()],
    "queue.clear.errored": [["Z"], () => this.isControlPressed.value && amethyst.player.queue.clearErrored()],
    "queue.force.refresh.meta": [["r"], () => this.isControlPressed.value && this.isAltPressed.value && amethyst.player.queue.fetchAsyncData(true)],
    "appearance.toggle.playback_controlls": [["F10"], () => useState().settings.value.showPlaybackControls = !useState().settings.value.showPlaybackControls],
    "appearance.toggle.debug_statistics": [["F9"], () => useState().settings.value.showDebugStats = !useState().settings.value.showDebugStats],
  };

  public bindings = this.DEFAULT_BINDINGS;
  public customBindings = useLocalStorage<CustomShortcutBindings>("customShortcuts", {}).value;

  public constructor() {
    this.registerShortcuts();
  }

  public registerShortcuts() {
    for (let i = 0; i < Object.entries(this.bindings).length; i++) {
      const [actionName] = Object.entries(this.bindings)[i];
      const [defaultKeys, action] = this.bindings[actionName];

      // Get the user config keys
      const customKeys = this.customBindings[actionName];

      // Replace the defaults with the user's options
      const keys = customKeys || defaultKeys;

      // Register the event for each key
      for (let j = 0; j < keys.length; j++)
        onKeyStroke(keys[j], e => {
          e.stopPropagation();
          action(e);
        });
    }
  }
}
