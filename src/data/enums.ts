// Enums mirrored from the game's native dump (see docs/DATA_SCHEMA.md).

export const UnitType = {
  Infantry: 2,
  Vehicle: 4,
  Helicopter: 8,
  Aircraft: 16,
  Ship: 32,
  Projectile: 128,
  SEADMissile: 256,
  CruiseMissile: 512,
  BallisticMissile: 1024,
} as const

// NOTE: the native dump lists this enum 1-based, but the shipped database is
// 0-based (verified: BMP-3 → 2 Vehicles, HIMARS → 3 Support, Su-57 → 6).
export const UnitCategoryType: Record<number, string> = {
  0: 'Recon',
  1: 'Infantry',
  2: 'Vehicles',
  3: 'Support',
  4: 'Logistic',
  5: 'Helicopters',
  6: 'Aircrafts',
}

export const UnitRole: Record<number, string> = {
  10: 'IFV',
  11: 'Tank',
  12: 'APC',
  13: 'LSV',
  14: 'Cargo Truck',
  15: 'Long Range SAM',
  16: 'Short Range SAM',
  30: 'Line Infantry',
  31: 'Assault Infantry',
  32: 'Recon Infantry',
  33: 'Snipers',
  34: 'AA Infantry',
  35: 'ATGM Infantry',
  36: 'Special Forces',
  70: 'Recon Helicopter',
  71: 'Multi-Role Helicopter',
  72: 'Heavy Transport Helicopter',
  73: 'Attack Helicopter',
  100: 'Drone',
  130: 'MLRS',
  131: 'Mortar',
  132: 'LAM',
  133: 'Artillery',
  160: 'Assault Plane',
  161: 'Bomber',
  162: 'Strategic Bomber',
  163: 'Transport Plane',
  164: 'Multi-Role Plane',
  200: 'Ship',
  201: 'Hovercraft',
}

// Labels use the in-game strings (ui_enum_weapontype_* in localization);
// the expanded card titles the weapon detail pane with these.
export const WeaponType: Record<number, string> = {
  1: 'Assault rifle',
  2: 'Assault rifle',
  3: 'Marksman rifle',
  4: 'Sniper rifle',
  5: 'Assault rifle',
  25: 'Submachine gun',
  26: 'Light machine gun',
  27: 'Medium machine gun',
  28: 'Heavy machine gun',
  29: 'Minigun',
  40: 'Shotgun',
  60: 'Grenade launcher',
  62: 'Rocket launcher',
  63: 'Rocket launcher',
  80: 'Anti-tank missile',
  82: 'Cruise missile',
  83: 'Ballistic missile',
  84: 'Anti-radiation missile',
  85: 'Anti-Aircraft missile',
  86: 'Surface-to-Air missile',
  87: 'Air-to-Air missile',
  88: 'Air-to-Air missile',
  89: 'Air-to-Ground missile',
  110: 'Main gun',
  111: 'Howitzer',
  112: 'Mortar',
  113: 'MLRS',
  114: 'Autocannon/Chain gun',
  115: 'Anti-aircraft gun',
  116: 'Plane gun',
  140: 'Rocket pod',
  141: 'Gun pod',
  160: 'Free-fall bomb',
  161: 'High-drag bomb',
  162: 'Smart bomb',
}

// Ammunitions.TrajectoryType → ui_enum_trajectory_* strings.
export const TrajectoryType: Record<number, string> = {
  10: 'Direct shot',
  20: 'Artillery',
  30: 'Mortar',
  40: 'MLRS',
  110: 'Missile',
  200: 'Cruise missile',
  300: 'Ballistic missile',
  400: 'Bomb',
  410: 'High-drag Bomb',
}

// ── Localization keys (resolved through GameDb.locOr with the English maps
//    above as fallback) ─────────────────────────────────────────────────────

export const UnitCategoryLocKey: Record<number, string> = {
  0: 'ui_arsenal_category_rec',
  1: 'ui_arsenal_category_inf',
  2: 'ui_arsenal_category_veh',
  3: 'ui_arsenal_category_sup',
  // no arsenal key exists for Logistic in the shipped localization
  5: 'ui_arsenal_category_hel',
  6: 'ui_arsenal_category_air',
}

export const WeaponTypeLocKey: Record<number, string> = {
  1: 'ui_enum_weapontype_rifle',
  2: 'ui_enum_weapontype_battle_rifle',
  3: 'ui_enum_weapontype_marksman_rifle',
  4: 'ui_enum_weapontype_sniper_rifle',
  5: 'ui_enum_weapontype_assault_rifle',
  25: 'ui_enum_weapontype_smg',
  26: 'ui_enum_weapontype_autorifle',
  27: 'ui_enum_weapontype_machinegun_light',
  28: 'ui_enum_weapontype_machinegun_heavy',
  29: 'ui_enum_weapontype_minigun',
  40: 'ui_enum_weapontype_shotgun',
  60: 'ui_enum_weapontype_gl',
  62: 'ui_enum_weapontype_rpg',
  63: 'ui_enum_weapontype_rpg',
  80: 'ui_enum_weapontype_atgm',
  82: 'ui_enum_weapontype_missile_cruise',
  83: 'ui_enum_weapontype_missile_ballistic',
  84: 'ui_enum_weapontype_missile_sead',
  85: 'ui_enum_weapontype_missile_manpad',
  86: 'ui_enum_weapontype_missile_sam',
  87: 'ui_enum_weapontype_missile_a2a_radar',
  88: 'ui_enum_weapontype_missile_a2a_ir',
  89: 'ui_enum_weapontype_missile_a2g',
  110: 'ui_enum_weapontype_main_tankgun',
  111: 'ui_enum_weapontype_howitzer',
  112: 'ui_enum_weapontype_mortar',
  113: 'ui_enum_weapontype_mlrs',
  114: 'ui_enum_weapontype_autocannon',
  115: 'ui_enum_weapontype_aa_gun',
  116: 'ui_enum_weapontype_plane_gun',
  140: 'ui_enum_weapontype_pod_rockets',
  141: 'ui_enum_weapontype_pod_gun',
  160: 'ui_enum_weapontype_bomb',
  161: 'ui_enum_weapontype_bomb_highdrag',
  162: 'ui_enum_weapontype_bomb_smart',
}

export const TrajectoryLocKey: Record<number, string> = {
  10: 'ui_enum_trajectory_direct',
  20: 'ui_enum_trajectory_artillery',
  30: 'ui_enum_trajectory_mortar',
  40: 'ui_enum_trajectory_mlrs',
  110: 'ui_enum_trajectory_missile',
  200: 'ui_enum_trajectory_cruise',
  300: 'ui_enum_trajectory_ballistic',
  400: 'ui_enum_trajectory_bomb',
  410: 'ui_enum_trajectory_bomb_highdrag',
}

export const ContentMembership: Record<number, string> = {
  [-1]: 'Vanilla',
  0: 'Internal',
  1: 'DLC1 Vanguard Edition',
  2: 'DLC2',
  3: 'DLC3',
  4: 'DLC4',
  5: 'DLC5',
}
