import type { Lang } from '../state/store'

// App-chrome strings that have no key in the game's localization files
// (game keys go through db.loc/locOr instead — see UnitPicker's categories).
const STRINGS = {
  expanded: { eng: 'Expanded', chi: '详细' },
  compact: { eng: 'Compact', chi: '默认' },
  logs: { eng: 'Logs', chi: '日志' },
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
  themeDefault: { eng: 'Theme default', chi: '主题默认色' },
  pickColor: { eng: 'Pick color', chi: '选择颜色' },

  // App chrome
  loadFailed: { eng: 'Failed to load data', chi: '数据加载失败' },
  loading: { eng: 'Loading unit database…', chi: '正在加载单位数据库…' },
  viewSource: { eng: 'View source on GitHub', chi: '在 GitHub 查看源代码' },
  langToggle: {
    eng: 'UI language (cards always use in-game English)',
    chi: '界面语言（卡片始终使用游戏内英文）',
  },
  emptyWorkspace: { eng: 'Select a unit to build its card.', chi: '选择一个单位以生成卡片。' },

  // Unit picker / variant panel
  searchUnits: { eng: 'Search units…', chi: '搜索单位…' },
  variants: { eng: 'Variants', chi: '变体' },

  // Icon picker dialog (weapons / ammo / tag icons)
  close: { eng: 'Close', chi: '关闭' },
  search: { eng: 'Search…', chi: '搜索…' },
  noMatches: { eng: 'No matches.', chi: '无匹配结果。' },
  uploadImage: { eng: 'Upload image…', chi: '上传图片…' },
  clear: { eng: 'Clear', chi: '清除' },
  selectWeapon: { eng: 'Select weapon', chi: '选择武器' },
  selectAmmo: { eng: 'Select ammo', chi: '选择弹药' },
  selectTagIcon: { eng: 'Select tag icon', chi: '选择标签图标' },

  // Card edit chrome
  remove: { eng: 'Remove', chi: '移除' },
  addWeapon: { eng: '+ Add weapon', chi: '+ 添加武器' },
  addWeaponShort: { eng: '+ Add', chi: '+ 添加' },
  addAmmo: { eng: '+ Add ammo', chi: '+ 添加弹药' },
  changeWeapon: { eng: 'Change weapon / icon', chi: '更换武器 / 图标' },
  changeAmmo: { eng: 'Change ammo / icon', chi: '更换弹药 / 图标' },
  changeTag: { eng: 'Change or clear tag icon', chi: '更换或清除标签图标' },
  addTagIcon: { eng: 'Add tag icon', chi: '添加标签图标' },

  // Crop dialog
  usePortrait: { eng: 'Use portrait', chi: '使用此立绘' },

  // Kill-log board
  emptyLog: { eng: 'Enable Edit to build a kill log.', chi: '开启「编辑」以创建击杀日志。' },
  addKill: { eng: '+ Add kill', chi: '+ 添加击杀' },
  addVictim: { eng: '+ Add victim', chi: '+ 添加受害者' },
  addVictimInline: { eng: '+ victim', chi: '+ 受害者' },
  removeKill: { eng: 'Remove kill', chi: '移除击杀' },
  removeVictim: { eng: 'Remove victim', chi: '移除受害者' },
  chooseUnitUpload: { eng: 'Choose unit / upload icon', chi: '选择单位 / 上传图标' },

  // Log unit picker
  selectUnit: { eng: 'Select unit', chi: '选择单位' },
  chooseVariant: { eng: 'Choose variant', chi: '选择变体' },
  uploadIcon: { eng: 'Upload icon…', chi: '上传图标…' },
  clearIcon: { eng: 'Clear icon', chi: '清除图标' },
  back: { eng: '← Back', chi: '← 返回' },
  useUnit: { eng: 'Use unit', chi: '使用此单位' },
} satisfies Record<string, Record<Lang, string>>

export type UiStringKey = keyof typeof STRINGS

export function t(lang: Lang, key: UiStringKey): string {
  return STRINGS[key][lang]
}
