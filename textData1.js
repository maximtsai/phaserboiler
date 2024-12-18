let language = 'en_us';

let textData = {
    "translate_warn": {
        "en_us": " ",
        "fr": "(Remarque: Certaines traductions\npeuvent être inexactes)",
        "zh_tw": "(註：有些翻譯可能不準確)",
        "zh_cn": "(注：有些翻译可能不准确)",
        "ru": "(Предупреждение: некоторые переводы могут содержать неточности)",
        "es": "",
        "jp": ""
    },
    "credits": {
        "en_us": "CREDITS",
        "fr": "CRÉDITS",
        "zh_tw": "制作名单",
        "zh_cn": "制作名单",
        "ru": "",
        "es": "",
        "jp": "。"
    },
    "wishlist": {
        "en_us": "WISHLIST!",
        "fr": "Liste de\nSouhaits!",
        "zh_tw": "心願單",
        "zh_cn": "心愿单!",
        "ru": "",
        "es": "",
        "jp": "。"
    },
    "post_fight_noupgrade": {
        "en_us": "No Upgrade",
        "fr": "Pas de mise à niveau",
        "zh_tw": "無需升級",
        "zh_cn": "无需升级",
        "ru": "Без апгрейда",
        "es": "Sin actualización",
        "jp": "アップグレードなし"
    },
    "post_fight_upgrade": {
        "en_us": "Upgraded!",
        "fr": "Amélioré!",
        "zh_tw": "升級！",
        "zh_cn": "升级！",
        "ru": "Обновлены!",
        "es": "¡Actualizado!",
        "jp": "アップグレード！"
    },
    "post_fight_day": {
        "en_us": "DAY ",
        "fr": "JOUR ",
        "zh_tw": "第",
        "zh_cn": "第",
        "ru": "День",
        "es": "DIA",
        "jp": ""
    },
    "post_fight_day2": {
        "en_us": "",
        "fr": "",
        "zh_tw": "天",
        "zh_cn": "天",
        "ru": "",
        "es": "",
        "jp": "日目"
    },
    "new_game": {
        "en_us": "NEW GAME",
        "fr": "NOUVEAU JEU",
        "zh_tw": "新遊戲",
        "zh_cn": "新游戏",
        "ru": "НОВАЯ ИГРА",
        "es": "NUEVO JUEGO",
        "jp": "新しいゲーム"
    },
    "post_fight_continue": {
        "en_us": "CONTINUE",
        "fr": "CONTINUER",
        "zh_tw": "繼續",
        "zh_cn": "继续",
        "ru": "ПРОДОЛЖАТЬ",
        "es": "CONTINUAR",
        "jp": "続ける"
    },
    "lvl_select": {
        "en_us": "LEVEL SELECT",
        "fr": "SÉLECTION NIVEAU",
        "zh_tw": "等級選擇",
        "zh_cn": "级别选择",
        "ru": "ПРОДОЛЖАТЬ",
        "es": "CONTINUAR",
        "jp": "続ける"
    },
    "skip": {
        "en_us": "SKIP",
        "fr": "SAUTER",
        "zh_tw": "跳过",
        "zh_cn": "跳過",
        "ru": "ПОКИДАТЬ",
        "es": "ABANDONAR",
        "jp": "やめる"
    },
    "exit": {
        "en_us": "EXIT",
        "fr": "QUITTER",
        "zh_tw": "退出",
        "zh_cn": "退出",
        "ru": "ПОКИДАТЬ",
        "es": "ABANDONAR",
        "jp": "やめる"
    },
    "back": {
        "en_us": "BACK",
        "fr": "RETOUR",
        "zh_tw": "返回",
        "zh_cn": "返回",
        "ru": "ОТМЕНА",
        "es": "CANCELAR",
        "jp": "キャンセル"
    },
    "main_menu": {
        "en_us": "MAIN MENU?",
        "fr": "MENU PRINCIPAL?",
        "zh_tw": "主選單",
        "zh_cn": "主菜单",
        "ru": "ГЛАВНОЕ МЕНЮ?",
        "es": "MENÚ PRINCIPAL?",
        "jp": "メインメニュー？"
    },
    "skip_long": {
        "en_us": "Skip to the next level?",
        "fr": "Passer au niveau suivant ?",
        "zh_tw": "跳到下一級？",
        "zh_cn": "跳到下一级？",
        "ru": "Выйти из боя и вернуться\nв главное меню?",
        "es": "¿Salir de la pelea y\nvolver al menú principal?",
        "jp": "戦闘を終了してメイン\nメニューに戻りますか?"
    },
}

function setLanguage(lang) {
    language = lang;
    localStorage.setItem("language", lang);

    messageBus.publish('language_switch', lang)
}

function getLangText(textName) {
    if (!textData[textName]) {
        console.error("Missing text name ", textName);
        return "MISSING TEXT";
    }
    return textData[textName][language];
}

function getBasicText(textName) {
    if (!textData[textName]) {
        console.error("Missing text name ", textName);
        return "MISSING TEXT";
    }
    return textData[textName];
}
