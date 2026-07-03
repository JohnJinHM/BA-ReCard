import type { Lang } from '../state/store'

// App-chrome strings that have no key in the game's localization files
// (game keys go through db.loc/locOr instead — see UnitPicker's categories).
const STRINGS = {
  expanded: { eng: 'Expanded', chi: '详细' },
  compact: { eng: 'Compact', chi: '默认' },
  edit: { eng: 'Edit', chi: '编辑' },
  editing: { eng: 'Editing…', chi: '编辑中…' },
  portrait: { eng: 'Portrait…', chi: '导入图片…' },
  reset: { eng: 'Reset', chi: '重置' },
  exportPng: { eng: 'Export PNG', chi: '导出 PNG' },
  exporting: { eng: 'Exporting…', chi: '导出中…' },
} satisfies Record<string, Record<Lang, string>>

export type UiStringKey = keyof typeof STRINGS

export function t(lang: Lang, key: UiStringKey): string {
  return STRINGS[key][lang]
}
