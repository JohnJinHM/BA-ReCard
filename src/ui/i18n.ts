import type { Lang } from '../state/store'

// App-chrome strings that have no key in the game's localization files
// (game keys go through db.loc/locOr instead — see UnitPicker's categories).
const STRINGS = {
  expanded: { eng: 'Expanded', chi: '详细' },
  compact: { eng: 'Compact', chi: '默认' },
  edit: { eng: 'Edit', chi: '编辑' },
  editing: { eng: 'Editing…', chi: '编辑中…' },
  portrait: { eng: 'Import...', chi: '导入图片…' },
  reset: { eng: 'Reset', chi: '重置' },
  exportPng: { eng: 'Export PNG', chi: '导出 PNG' },
  exporting: { eng: 'Exporting…', chi: '导出中…' },
  unsavedTitle: { eng: 'Unsaved edits', chi: '未保存的修改' },
  unsavedBody: {
    eng: 'Switching cards will discard your current edits.',
    chi: '切换卡片将放弃当前的修改。',
  },
  discard: { eng: 'Discard edits', chi: '放弃修改' },
  cancel: { eng: 'Cancel', chi: '取消' },
  textColor: { eng: 'Text Color', chi: '文字颜色' },
  textColorHint: {
    eng: 'Click text on the card to recolor it.',
    chi: '点击卡片上的文字以更改颜色。',
  },
} satisfies Record<string, Record<Lang, string>>

export type UiStringKey = keyof typeof STRINGS

export function t(lang: Lang, key: UiStringKey): string {
  return STRINGS[key][lang]
}
