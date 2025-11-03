// API Configuration Module
export const API_CONFIG = {
    SEFARIA_BASE: 'https://www.sefaria.org/api',
    ENGLISH_VERSION: 'The Contemporary Torah, Jewish Publication Society, 2006',
    HEBREW_VERSION: 'Miqra_according_to_the_Masorah'
};

// Torah Parshas Data
export const TORAH_PARSHAS = [
    // Bereshit (Genesis)
    { name: 'Bereshit', reference: 'Genesis 1:1-6:8', book: 'Genesis' },
    { name: 'Noach', reference: 'Genesis 6:9-11:32', book: 'Genesis' },
    { name: 'Lech-Lecha', reference: 'Genesis 12:1-17:27', book: 'Genesis' },
    { name: 'Vayera', reference: 'Genesis 18:1-22:24', book: 'Genesis' },
    { name: 'Chayei Sara', reference: 'Genesis 23:1-25:18', book: 'Genesis' },
    { name: 'Toldot', reference: 'Genesis 25:19-28:9', book: 'Genesis' },
    { name: 'Vayetzei', reference: 'Genesis 28:10-32:3', book: 'Genesis' },
    { name: 'Vayishlach', reference: 'Genesis 32:4-36:43', book: 'Genesis' },
    { name: 'Vayeshev', reference: 'Genesis 37:1-40:23', book: 'Genesis' },
    { name: 'Miketz', reference: 'Genesis 41:1-44:17', book: 'Genesis' },
    { name: 'Vayigash', reference: 'Genesis 44:18-47:27', book: 'Genesis' },
    { name: 'Vayechi', reference: 'Genesis 47:28-50:26', book: 'Genesis' },
    
    // Shemot (Exodus)
    { name: 'Shemot', reference: 'Exodus 1:1-6:1', book: 'Exodus' },
    { name: 'Vaera', reference: 'Exodus 6:2-9:35', book: 'Exodus' },
    { name: 'Bo', reference: 'Exodus 10:1-13:16', book: 'Exodus' },
    { name: 'Beshalach', reference: 'Exodus 13:17-17:16', book: 'Exodus' },
    { name: 'Yitro', reference: 'Exodus 18:1-20:23', book: 'Exodus' },
    { name: 'Mishpatim', reference: 'Exodus 21:1-24:18', book: 'Exodus' },
    { name: 'Terumah', reference: 'Exodus 25:1-27:19', book: 'Exodus' },
    { name: 'Tetzaveh', reference: 'Exodus 27:20-30:10', book: 'Exodus' },
    { name: 'Ki Tisa', reference: 'Exodus 30:11-34:35', book: 'Exodus' },
    { name: 'Vayakhel', reference: 'Exodus 35:1-38:20', book: 'Exodus' },
    { name: 'Pekudei', reference: 'Exodus 38:21-40:38', book: 'Exodus' },
    
    // Vayikra (Leviticus)
    { name: 'Vayikra', reference: 'Leviticus 1:1-5:26', book: 'Leviticus' },
    { name: 'Tzav', reference: 'Leviticus 6:1-8:36', book: 'Leviticus' },
    { name: 'Shmini', reference: 'Leviticus 9:1-11:47', book: 'Leviticus' },
    { name: 'Tazria', reference: 'Leviticus 12:1-13:59', book: 'Leviticus' },
    { name: 'Metzora', reference: 'Leviticus 14:1-15:33', book: 'Leviticus' },
    { name: 'Achrei Mot', reference: 'Leviticus 16:1-18:30', book: 'Leviticus' },
    { name: 'Kedoshim', reference: 'Leviticus 19:1-20:27', book: 'Leviticus' },
    { name: 'Emor', reference: 'Leviticus 21:1-24:23', book: 'Leviticus' },
    { name: 'Behar', reference: 'Leviticus 25:1-26:2', book: 'Leviticus' },
    { name: 'Bechukotai', reference: 'Leviticus 26:3-27:34', book: 'Leviticus' },
    
    // Bamidbar (Numbers)
    { name: 'Bamidbar', reference: 'Numbers 1:1-4:20', book: 'Numbers' },
    { name: 'Nasso', reference: 'Numbers 4:21-7:89', book: 'Numbers' },
    { name: 'Beha\'alotcha', reference: 'Numbers 8:1-12:16', book: 'Numbers' },
    { name: 'Sh\'lach', reference: 'Numbers 13:1-15:41', book: 'Numbers' },
    { name: 'Korach', reference: 'Numbers 16:1-18:32', book: 'Numbers' },
    { name: 'Chukat', reference: 'Numbers 19:1-22:1', book: 'Numbers' },
    { name: 'Balak', reference: 'Numbers 22:2-25:9', book: 'Numbers' },
    { name: 'Pinchas', reference: 'Numbers 25:10-30:1', book: 'Numbers' },
    { name: 'Matot', reference: 'Numbers 30:2-32:42', book: 'Numbers' },
    { name: 'Masei', reference: 'Numbers 33:1-36:13', book: 'Numbers' },
    
    // Devarim (Deuteronomy)
    { name: 'Devarim', reference: 'Deuteronomy 1:1-3:22', book: 'Deuteronomy' },
    { name: 'Vaetchanan', reference: 'Deuteronomy 3:23-7:11', book: 'Deuteronomy' },
    { name: 'Eikev', reference: 'Deuteronomy 7:12-11:25', book: 'Deuteronomy' },
    { name: 'Re\'eh', reference: 'Deuteronomy 11:26-16:17', book: 'Deuteronomy' },
    { name: 'Shoftim', reference: 'Deuteronomy 16:18-21:9', book: 'Deuteronomy' },
    { name: 'Ki Teitzei', reference: 'Deuteronomy 21:10-25:19', book: 'Deuteronomy' },
    { name: 'Ki Tavo', reference: 'Deuteronomy 26:1-29:8', book: 'Deuteronomy' },
    { name: 'Nitzavim', reference: 'Deuteronomy 29:9-30:20', book: 'Deuteronomy' },
    { name: 'Vayeilech', reference: 'Deuteronomy 31:1-31:30', book: 'Deuteronomy' },
    { name: 'Ha\'Azinu', reference: 'Deuteronomy 32:1-32:52', book: 'Deuteronomy' },
    { name: 'V\'Zot HaBerachah', reference: 'Deuteronomy 33:1-34:12', book: 'Deuteronomy' }
];
