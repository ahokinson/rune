// The care actions, each bound to its own key and shown along the bottom of the
// screen as a key reference. Kept to text labels so it reads in any terminal.

export enum MenuAction {
  Feed = "feed",
  Play = "play",
  Clean = "clean",
  Medicine = "medicine",
  Discipline = "discipline",
  Light = "light",
}

export interface MenuItem {
  action: MenuAction
  label: string
  key: string
}

export const MENU: readonly MenuItem[] = [
  { action: MenuAction.Feed, label: "FEED", key: "f" },
  { action: MenuAction.Play, label: "PLAY", key: "p" },
  { action: MenuAction.Clean, label: "CLEAN", key: "c" },
  { action: MenuAction.Medicine, label: "MED", key: "m" },
  { action: MenuAction.Discipline, label: "SCOLD", key: "s" },
  { action: MenuAction.Light, label: "LIGHT", key: "l" },
]
