"use client";

import { create } from "zustand";

/**
 * État global du composer de publication du feed.
 *
 * Levé d'état nécessaire car le déclencheur peut vivre hors de `FeedList`
 * (bouton `+` de la topbar sticky mobile, barre `RoleShell`, FAB desktop).
 */
interface ComposerState {
  feedComposerOpen: boolean;
  openFeedComposer: () => void;
  closeFeedComposer: () => void;
}

export const useComposerStore = create<ComposerState>((set) => ({
  feedComposerOpen: false,
  openFeedComposer: () => set({ feedComposerOpen: true }),
  closeFeedComposer: () => set({ feedComposerOpen: false }),
}));
