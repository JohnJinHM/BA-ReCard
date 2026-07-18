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
  saveAndSwitch: { eng: 'Save & switch', chi: '保存并切换' },
  cancel: { eng: 'Cancel', chi: '取消' },
  save: { eng: 'Save', chi: '保存' },
  savedCards: { eng: 'Saved Cards', chi: '已保存卡片' },
  savedEmpty: {
    eng: 'Nothing saved yet — Save keeps the current card here.',
    chi: '尚未保存卡片——点击「保存」将当前卡片存到这里。',
  },
  load: { eng: 'Load', chi: '载入' },
  delete: { eng: 'Delete', chi: '删除' },
  deleteConfirm: { eng: 'Delete this saved card?', chi: '删除这张已保存的卡片？' },
  saveFailed: {
    eng: 'Save failed: browser storage is full.',
    chi: '保存失败：浏览器存储空间已满。',
  },
  exportJson: { eng: 'Export JSON', chi: '导出 JSON' },
  importJson: { eng: 'Import JSON…', chi: '导入 JSON…' },
  importFailed: {
    eng: 'Import failed: not an exported card file.',
    chi: '导入失败：不是导出的卡片文件。',
  },
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
