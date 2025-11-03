/**
 * Structured data for the Important Prayers/Readings experience.
 * Each entry contains the English, Hebrew, and transliteration text that
 * should be rendered on the prayers page.
 */
const PRAYER_DATA = [
  {
    id: "shema",
    order: 1,
    title: "Shema Yisrael (Hear, O Israel)",
    label: "Shema Yisrael",
    summary: "Affirm God\'s oneness and place these words upon your heart.",
    category: "daily",
    english: `Hear, O Israel: the Lord is our God, the Lord is One.
Blessed be the name of His glorious kingdom forever and ever.
You shall love the Lord your God with all your heart, with all your soul, and with all your might. And these words, which I command you this day, shall be upon your heart. You shall teach them diligently to your children, and shall speak of them when you sit in your house, and when you walk by the way, and when you lie down, and when you rise up. And you shall bind them for a sign upon your hand, and they shall be for frontlets between your eyes. And you shall write them upon the doorposts of your house and upon your gates.`,
    hebrew: `שְׁמַע יִשְׂרָאֵל יְהוָה אֱלֹהֵינוּ יְהוָה אֶחָד.
(בָּרוּךְ שֵׁם כְּבוֹד מַלְכוּתוֹ לְעוֹלָם וָעֶד.)
וְאָהַבְתָּ אֵת יְהוָה אֱלֹהֶיךָ בְּכָל לְבָבְךָ וּבְכָל נַפְשְׁךָ וּבְכָל מְאֹדֶךָ. וְהָיוּ הַדְּבָרִים הָאֵלֶּה אֲשֶׁר אָנֹכִי מְצַוְּךָ הַיּוֹם עַל לְבָבֶךָ. וְשִׁנַּנְתָּם לְבָנֶיךָ וְדִבַּרְתָּ בָּם בְּשִׁבְתְּךָ בְבֵיתֶךָ וּבְלֶכְתְּךָ בַדֶּרֶךְ וּבְשָׁכְבְּךָ וּבְקוּמֶךָ. וּקְשַׁרְתָּם לְאוֹת עַל יָדֶךָ וְהָיוּ לְטֹטָפֹת בֵּין עֵינֶיךָ. וּכְתַבְתָּם עַל מְזוּזֹת בֵּיתֶךָ וּבִשְׁעָרֶיךָ.`,
    transliteration: `Sh'ma Yisrael Adonai Eloheinu Adonai Echad.
(Baruch shem k'vod malchuto l'olam va'ed.)
V'ahavta et Adonai Elohecha b'chol l'vavcha u'v'chol nafsh'cha u'v'chol m'odecha. V'hayu had'varim ha'eleh asher anochi m'tzav'cha hayom al l'vavecha. V'shinantam l'vanecha v'dibarta bam b'shivt'cha b'veitecha u'v'lech't'cha vaderech u'v'shochb'cha u'v'kumecha. U'kshartam l'ot al yadecha v'hayu l'totafot bein einecha. U'chtavtam al m'zuzot beitecha u'vish'arecha.`
  },
  {
    id: "amidah-first",
    order: 2,
    title: "Amidah - First 3 Blessings (Avot, Gevurot, Kedushah)",
    label: "Amidah – Opening",
    summary: "Begin the Amidah with praise for God\'s ancestors, might, and holiness.",
    category: "amidah",
    english: `(Avot - Patriarchs)
Blessed are You, Lord our God and God of our fathers, God of Abraham, God of Isaac, and God of Jacob, the great, mighty, and awesome God, the supreme God, Who bestows beneficial kindnesses and creates everything, Who remembers the piety of the patriarchs and brings a redeemer to their children's children, for His name's sake, with love. O King, Helper, Savior, and Shield. Blessed are You, Lord, Shield of Abraham.

(Gevurot - God's Might)
You are mighty forever, O Lord; You resurrect the dead; You are powerful to save. You cause the dew to descend (Winter: You cause the wind to blow and the rain to fall). You sustain the living with lovingkindness, You resurrect the dead with great mercy, You support the fallen, heal the sick, release the bound, and keep Your faith with those who sleep in the dust. Who is like You, Master of mighty deeds? And who can be compared to You, O King, Who causes death and restores life, and causes salvation to sprout? You are faithful to resurrect the dead. Blessed are You, Lord, Who resurrects the dead.

(Kedushah - Sanctification)
Reader: We shall sanctify Your name in the world, just as they sanctify it in the highest heavens, as it is written by Your prophet: "And they called one to another and said:
Cong: Holy, holy, holy is the Lord of hosts; the whole earth is full of His glory."
Reader: Those facing them say, Blessed...
Cong: Blessed is the glory of the Lord from His place.
Reader: And in Your Holy Writings it is written, saying:
Cong: The Lord shall reign forever; Your God, O Zion, throughout all generations. Hallelujah!
Reader: Throughout all generations we will declare Your greatness, and to all eternity we will proclaim Your holiness. Your praise, our God, shall never depart from our mouth, for You are a great and holy God and King. Blessed are You, Lord, the holy God. (Amen)`,
    hebrew: `(Avot)
בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ. אֱלֹהֵי אַבְרָהָם. אֱלֹהֵי יִצְחָק. וֵאלֹהֵי יַעֲקב. הָאֵל הַגָּדוֹל הַגִּבּוֹר וְהַנּוֹרָא אֵל עֶלְיוֹן. גּוֹמֵל חֲסָדִים טוֹבִים וְקוֹנֵה הַכּל. וְזוֹכֵר חַסְדֵי אָבוֹת וּמֵבִיא גוֹאֵל לִבְנֵי בְנֵיהֶם לְמַעַן שְׁמוֹ בְּאַהֲבָה: מֶלֶךְ עוֹזֵר וּמוֹשִׁיעַ וּמָגֵן: בָּרוּךְ אַתָּה יְהוָה מָגֵן אַבְרָהָם:

(Gevurot)
אַתָּה גִבּוֹר לְעוֹלָם אֲדנָי. מְחַיֵּה מֵתִים אַתָּה רַב לְהוֹשִׁיעַ: מוֹרִיד הַטָּל (בחורף: מַשִּׁיב הָרוּחַ וּמוֹרִיד הַגֶּשֶׁם): מְכַלְכֵּל חַיִּים בְּחֶסֶד. מְחַיֵּה מֵתִים בְּרַחֲמִים רַבִּים. סוֹמֵךְ נוֹפְלִים וְרוֹפֵא חוֹלִים וּמַתִּיר אֲסוּרִים. וּמְקַיֵּם אֱמוּנָתוֹ לִישֵׁנֵי עָפָר. מִי כָמוךָ בַּעַל גְּבוּרוֹת וּמִי דוֹמֶה לָּךְ. מֶלֶךְ מֵמִית וּמְחַיֶּה וּמַצְמִיחַ יְשׁוּעָה: וְנֶאֱמָן אַתָּה לְהַחֲיוֹת מֵתִים: בָּרוּךְ אַתָּה יְהוָה מְחַיֵּה הַמֵּתִים:

(Kedushah)
חזן: נַקְדִּישָׁךְ וְנַעֲרִיצָךְ כְּנֹעַם שִׂיחַ סוֹד שַׂרְפֵי קֹדֶשׁ. הַמְשַׁלְּשִׁים לְךָ קְדֻשָּׁה. כַּכָּתוּב עַל יַד נְבִיאֶךָ. וְקָרָא זֶה אֶל זֶה וְאָמַר:
קהל: קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ יְהוָה צְבָאוֹת. מְלֹא כָל הָאָרֶץ כְּבוֹדוֹ:
חזן: לְעֻמָּתָם בָּרוּךְ יֹאמֵרוּ:
קהל: בָּרוּךְ כְּבוֹד יְהוָה מִמְּקוֹמוֹ:
חזן: וּבְדִבְרֵי קָדְשְׁךָ כָּתוּב לֵאמֹר:
קהל: יִמְלֹךְ יְהוָה לְעוֹלָם. אֱלֹהַיִךְ צִיּוֹן לְדֹר וָדֹר. הַלְלוּיָהּ:
חזן: לְדוֹר וָדוֹר נַגִּיד גָּדְלֶךָ וּלְנֵצַח נְצָחִים קְדֻשָּׁתְךָ נַקְדִּישׁ. וְשִׁבְחֲךָ אֱלֹהֵינוּ מִפִּינוּ לֹא יָמוּשׁ לְעוֹלָם וָעֶד. כִּי אֵל מֶלֶךְ גָּדוֹל וְקָדוֹשׁ אָתָּה: בָּרוּךְ אַתָּה יְהוָה הָאֵל הַקָּדוֹשׁ: (אמן)`,
    transliteration: `(Avot)
Baruch ata Adonai Eloheinu v'Elohei avoteinu, Elohei Avraham, Elohei Yitzchak, v'Elohei Yaakov, ha'El ha'gadol ha'gibor v'ha'nora, El elyon, gomel chasadim tovim v'koneh hakol, v'zocher chasdei avot u'mevi go'el livnei v'neihem l'ma'an sh'mo b'ahava. Melech ozer u'moshia u'magen. Baruch ata Adonai, magen Avraham.

(Gevurot)
Ata gibor l'olam Adonai, m'chayeh metim ata, rav l'hoshia. Morid ha'tal (Winter: Mashiv haruach u'morid hageshem). M'chalkel chayim b'chesed, m'chayeh metim b'rachamim rabim, somech noflim v'rofeh cholim u'matir asurim, u'm'kayem emunato lishenei afar. Mi chamocha ba'al g'vurot u'mi domeh lach, Melech memit u'm'chayeh u'matzmiach y'shua. V'ne'eman ata l'hachayot metim. Baruch ata Adonai, m'chayeh hametim.

(Kedushah)
Reader: Nakdishach v'na'aritzach k'noam siach sod sarfei kodesh, ham'shal'shim l'cha k'dusha, kakatuv al yad n'vi'echa: V'kara zeh el zeh v'amar:
Cong: Kadosh, Kadosh, Kadosh Adonai Tz'vaot, m'lo chol ha'aretz k'vodo.
Reader: L'umatam baruch yomeru:
Cong: Baruch k'vod Adonai mim'komo.
Reader: U'v'divrei kodsh'cha katuv lemor:
Cong: Yimloch Adonai l'olam, Elohayich Tzion l'dor va'dor, Halleluyah.
Reader: L'dor va'dor nagid godlecha u'l'netzach n'tzachim k'dushat'cha nakdish. V'shivchachah Eloheinu mipinu lo yamush l'olam va'ed, ki El Melech gadol v'kadosh ata. Baruch ata Adonai, ha'El ha'kadosh. (Amen)`
  },
  {
    id: "amidah-refaeinu",
    order: 3,
    title: "Amidah - Refa'einu (Healing Blessing)",
    label: "Amidah – Refa'einu",
    summary: "Ask for complete healing from the Compassionate Healer.",
    category: "healing",
    english: `Heal us, Lord, and we shall be healed; save us, and we shall be saved, for You are our praise. Bring complete recovery for all our illnesses, for You are God, King, the faithful and compassionate Healer. Blessed are You, Lord, Who heals the sick of His people Israel.`,
    hebrew: `רְפָאֵנוּ יְהוָה וְנֵרָפֵא. הוֹשִׁיעֵנוּ וְנִוָּשֵׁעָה כִּי תְהִלָּתֵנוּ אָתָּה. וְהַעֲלֵה רְפוּאָה שְׁלֵמָה לְכל מַכּוֹתֵינוּ. כִּי אֵל מֶלֶךְ רוֹפֵא נֶאֱמָן וְרַחֲמָן אָתָּה: בָּרוּךְ אַתָּה יְהוָה רוֹפֵא חוֹלֵי עַמּוֹ יִשְׂרָאֵל:`,
    transliteration: `R'fa'einu Adonai v'neirafei, hoshi'einu v'nivashei'ah, ki t'hilateinu ata. V'ha'aleh r'fuah sh'leimah l'chol makoteinu, ki El Melech rofeh ne'eman v'rachaman ata. Baruch ata Adonai, rofeh cholei amo Yisrael.`
  },
  {
    id: "amidah-last",
    order: 4,
    title: "Amidah - Last 3 Blessings (Avodah, Hoda'ah, Sim Shalom)",
    label: "Amidah – Closing",
    summary: "Close the Amidah by restoring service, thanking God, and seeking peace.",
    category: "amidah",
    english: `(Avodah - Temple Service)
Be favorable, Lord our God, toward Your people Israel and their prayer. Restore the service to the Holy of Holies of Your Temple. May the fire-offerings of Israel and their prayer be accepted with love and favor, and may the service of Your people Israel always be favorable to You. May our eyes behold Your return to Zion in mercy. Blessed are You, Lord, Who restores His Divine Presence to Zion.

(Hoda'ah - Thanksgiving)
We gratefully thank You, for You are Lord our God and God of our fathers forever. You are the Rock of our lives, the Shield of our salvation in every generation. We will give thanks to You and declare Your praise for our lives that are committed into Your hand, and for our souls that are entrusted to You; for Your miracles that are with us daily, and for Your wonders and Your benefits that are with us at all times — evening, morning, and noon. O Good One, Your mercies never fail; O Compassionate One, Your kindnesses never cease. We have always put our hope in You. For all these, may Your name, our King, be blessed and exalted continuously forever. Everything alive will gratefully acknowledge You, Selah!, and praise Your great name sincerely, O God of our salvation and help, Selah! Blessed are You, Lord, Your name is "The Good One," and to You it is fitting to give thanks.

(Sim Shalom - Grant Peace)
Grant peace, goodness, and blessing, grace, lovingkindness, and mercy upon us and upon all Israel, Your people. Bless us, our Father, all of us as one, with the light of Your countenance. For by the light of Your countenance You gave us, Lord our God, the Torah of life, lovingkindness, righteousness, blessing, mercy, life, and peace. May it be good in Your eyes to bless Your people Israel at all times and in every hour with Your peace. Blessed are You, Lord, Who blesses His people Israel with peace. (Amen)`,
    hebrew: `(Avodah)
רְצֵה יְהוָה אֱלֹהֵינוּ בְּעַמְּךָ יִשְׂרָאֵל וּבִתְפִלָּתָם. וְהָשֵׁב אֶת הָעֲבוֹדָה לִדְבִיר בֵּיתֶךָ. וְאִשֵּׁי יִשְׂרָאֵל וּתְפִלָּתָם בְּאַהֲבָה תְקַבֵּל בְּרָצוֹן. וּתְהִי לְרָצוֹן תָּמִיד עֲבוֹדַת יִשְׂרָאֵל עַמֶּךָ: וְתֶחֱזֶינָה עֵינֵינוּ בְּשׁוּבְךָ לְצִיּוֹן בְּרַחֲמִים: בָּרוּךְ אַתָּה יְהוָה הַמַּחֲזִיר שְׁכִינָתוֹ לְצִיּוֹן:

(Hoda'ah)
מוֹדִים אֲנַחְנוּ לָךְ. שָׁאַתָּה הוּא יְהוָה אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ לְעוֹלָם וָעֶד. צוּר חַיֵּינוּ. מָגֵן יִשְׁעֵנוּ אַתָּה הוּא לְדוֹר וָדוֹר. נוֹדֶה לְּךָ וּנְסַפֵּר תְּהִלָּתֶךָ. עַל חַיֵּינוּ הַמְּסוּרִים בְּיָדֶךָ. וְעַל נִשְׁמוֹתֵינוּ הַפְּקוּדוֹת לָךְ. וְעַל נִסֶּיךָ שֶׁבְּכָל יוֹם עִמָּנוּ. וְעַל נִפְלְאוֹתֶיךָ וְטוֹבוֹתֶיךָ שֶׁבְּכָל עֵת. עֶרֶב וָבֹקֶר וְצָהֳרָיִם. הַטּוֹב כִּי לא כָלוּ רַחֲמֶיךָ. וְהַמְרַחֵם כִּי לא תַמּוּ חֲסָדֶיךָ. כִּי מֵעוֹלָם קִוִּינוּ לָךְ: וְעַל כֻּלָּם יִתְבָּרַךְ וְיִתְרוֹמַם שִׁמְךָ מַלְכֵּנוּ תָּמִיד לְעוֹלָם וָעֶד: וְכל הַחַיִּים יוֹדוּךָ סֶּלָה וִיהַלְלוּ אֶת שִׁמְךָ הַגָּדוֹל בֶּאֱמֶת לְעוֹלָם כִּי טוֹב. הָאֵל יְשׁוּעָתֵנוּ וְעֶזְרָתֵנוּ סֶלָה. הָאֵל הַטּוֹב: בָּרוּךְ אַתָּה יְהוָה הַטּוֹב שִׁמְךָ וּלְךָ נָאֶה לְהוֹדוֹת:

(Sim Shalom)
שִׂים שָׁלוֹם טוֹבָה וּבְרָכָה חֵן וָחֶסֶד וְרַחֲמִים. עָלֵינוּ וְעַל כָּל יִשְׂרָאֵל עַמֶּךָ. בָּרְכֵנוּ אָבִינוּ כֻּלָּנוּ כְּאֶחָד בְּאוֹר פָּנֶיךָ. כִּי בְאוֹר פָּנֶיךָ נָתַתָּ לָּנוּ יְהוָה אֱלֹהֵינוּ תּוֹרַת חַיִּים וְאַהֲבַת חֶסֶד. וּצְדָקָה וּבְרָכָה וְרַחֲמִים וְחַיִּים וְשָׁלוֹם. וְטוֹב בְּעֵינֶיךָ לְבָרֵךְ אֶת עַמְּךָ יִשְׂרָאֵל בְּכָל עֵת וּבְכָל שָׁעָה בִּשְׁלוֹמֶךָ: בָּרוּךְ אַתָּה יְהוָה הַמְבָרֵךְ אֶת עַמּוֹ יִשְׂרָאֵל בַּשָּׁלוֹם: (אמן)`,
    transliteration: `(Avodah)
R'tzeh Adonai Eloheinu b'amcha Yisrael u'vitfilatam, v'hashev et ha'avodah lidvir beitecha, v'ishei Yisrael utfilatam b'ahavah t'kabel b'ratzon, ut'hi l'ratzon tamid avodat Yisrael amecha. V'techezenah eineinu b'shuvcha l'Tzion b'rachamim. Baruch ata Adonai, ha'machazir sh'chinato l'Tzion.

(Hoda'ah)
Modim anachnu lach sha'ata hu Adonai Eloheinu v'Elohei avoteinu l'olam va'ed. Tzur chayeinu, magen yish'einu ata hu l'dor va'dor. Nodeh l'cha u'n'saper t'hilatecha, al chayeinu ham'surim b'yadecha, v'al nishmoteinu hap'kudot lach, v'al nisecha sheb'chol yom imanu, v'al nifl'otecha v'tovotecha sheb'chol et, erev vavoker v'tzohorayim. Ha'tov ki lo chalu rachamecha, v'ha'm'rachem ki lo tamu chasadecha, ki me'olam kivinu lach. V'al kulam yitbarach v'yitromam shimcha malkeinu tamid l'olam va'ed. V'chol hachayim yoducha selah vihal'lu et shimchah hagadol be'emet l'olam ki tov, ha'El y'shuateinu v'ezrateinu selah, ha'El ha'tov. Baruch ata Adonai, ha'tov shimcha u'l'cha na'eh l'hodot.

(Sim Shalom)
Sim shalom tovah u'vrachah, chen vachesed v'rachamim, aleinu v'al kol Yisrael amecha. Barcheinu Avinu kulanu k'echad b'or panecha, ki v'or panecha natata lanu Adonai Eloheinu Torat chayim v'ahavat chesed, u'tzdakah u'vrachah v'rachamim v'chayim v'shalom. V'tov b'einecha l'varech et amcha Yisrael b'chol et u'v'chol sha'ah bishlomecha. Baruch ata Adonai, ha'm'varech et amo Yisrael bashalom. (Amen)`
  },
  {
    id: "modeh-ani",
    order: 5,
    title: "Modeh Ani (I Give Thanks)",
    label: "Modeh Ani",
    summary: "A gentle expression of gratitude upon waking.",
    category: "daily",
    english: `I gratefully thank You, O living and eternal King, for You have returned my soul within me with compassion—abundant is Your faithfulness!`,
    hebrew: `מוֹדֶה אֲנִי לְפָנֶיךָ מֶלֶךְ חַי וְקַיָּם. שֶׁהֶחֱזַרְתָּ בִּי נִשְׁמָתִי בְּחֶמְלָה. רַבָּה אֱמוּנָתֶךָ:`,
    transliteration: `Modeh ani l'fanecha Melech chai v'kayam, shehechezarta bi nishmati b'chemlah, rabbah emunatecha.`
  },
  {
    id: "mi-sheberach",
    order: 6,
    title: "Mi Sheberach for the Sick",
    label: "Prayer for the Sick",
    summary: "Personalize this blessing for someone in need of refuah shleimah.",
    category: "healing",
    english: `May He who blessed our fathers, Abraham, Isaac, and Jacob, bless [Hebrew name of the sick person] son/daughter of [Hebrew name of the mother]. May the Holy One, Blessed be He, be filled with compassion for him/her, to restore him/her, to heal him/her, to strengthen him/her, and to revive him/her. May He send him/her speedily a complete recovery from Heaven, for all his/her 248 bodily parts and 365 veins, among the other sick of Israel, a recovery of the soul and a recovery of the body, swiftly and soon. And let us say: Amen.`,
    hebrew: `מִי שֶׁבֵּרַךְ אֲבוֹתֵינוּ אַבְרָהָם יִצְחָק וְיַעֲקֹב הוּא יְבָרֵךְ אֶת הַחוֹלֶה/הַחוֹלָה [פלוני/פלונית בן/בת פלונית]. הַקָּדוֹשׁ בָּרוּךְ הוּא יִמָּלֵא רַחֲמִים עָלָיו/עָלֶיהָ לְהַחֲלִימוֹ/לְהַחֲלִימָהּ וּלְרַפְּאֹתוֹ/וּלְרַפְּאֹתָהּ וּלְהַחֲזִיקוֹ/וּלְהַחֲזִיקָהּ וּלְהַחֲיוֹתוֹ/וּלְהַחֲיוֹתָהּ. וְיִשְׁלַח לוֹ/לָהּ מְהֵרָה רְפוּאָה שְׁלֵמָה מִן הַשָּׁמַיִם. רְפוּאַת הַנֶּפֶשׁ וּרְפוּאַת הַגּוּף. בְּכָל רְמַ"ח אֵבָרָיו/אֵבָרֶיהָ וּשְׁסָ"ה גִידָיו/גִידֶיהָ בְּתוֹךְ שְׁאַר חוֹלֵי יִשְׂרָאֵל. הַשְׁתָּא בַּעֲגָלָא וּבִזְמַן קָרִיב וְנאמַר אָמֵן:`,
    transliteration: `Mi sheberach avoteinu Avraham, Yitzchak v'Yaakov, hu y'varech et ha'choleh/ha'cholah [Name of sick person] ben/bat [Name of mother]. HaKadosh Baruch Hu yimalei rachamim alav/aleha, l'hachalimo/l'hachalimah u'l'rap'oto/u'l'rap'otah u'l'hachaziko/u'l'hachazikah u'l'hachayoto/u'l'hachayotah. V'yishlach lo/lah m'heirah r'fuah sh'leimah min hashamayim, r'fuat hanefesh u'r'fuat haguf, b'chol R'MA"CH evarav/evareha v'SH'SA"H gidav/gideha b'toch sh'ar cholei Yisrael, hashta ba'agala u'vizman kariv, v'nomar Amen.`
  },
  {
    id: "tefilat-haderech",
    order: 7,
    title: "Tefilat HaDerech (Traveler's Prayer)",
    label: "Traveler's Prayer",
    summary: "Invoke safety, blessing, and grace on any journey.",
    category: "protection",
    english: `May it be Your will, Lord our God and God of our fathers, that You lead us toward peace, guide our footsteps toward peace, support us toward peace, and make us reach our desired destination for life, gladness, and peace. May You rescue us from the hand of every foe, ambush, bandits, and evil beasts along the way, and from all manner of punishments that assemble to come to earth. May You send blessing in our handiwork, and grant us grace, kindness, and mercy in Your eyes and in the eyes of all who see us. May You hear the sound of our supplication, for You are God who hears prayer and supplication. Blessed are You, Lord, who hears prayer.`,
    hebrew: `יְהִי רָצוֹן מִלְּפָנֶיךָ יְהוָה אֱלֹהֵינוּ וֵאלֹהֵי אֲבוֹתֵינוּ, שֶׁתּוֹלִיכֵנוּ לְשָׁלוֹם וְתַצְעִידֵנוּ לְשָׁלוֹם וְתַדְרִיכֵנוּ לְשָׁלוֹם, וְתִסְמְכֵנוּ לְשָׁלוֹם, וְתַגִּיעֵנוּ לִמְחוֹז חֶפְצֵנוּ לְחַיִּים וּלְשִׂמְחָה וּלְשָׁלוֹם. וְתַצִּילֵנוּ מִכַּף כָּל אוֹיֵב וְאוֹרֵב וְלִסְטִים וְחַיּוֹת רָעוֹת בַּדֶּרֶךְ, וּמִכָּל מִינֵי פֻּרְעָנֻיּוֹת הַמִּתְרַגְּשׁוֹת לָבוֹא לָעוֹלָם. וְתִשְׁלַח בְּרָכָה בְּכָל מַעֲשֵׂה יָדֵינוּ, וְתִתְּנֵנוּ לְחֵן וּלְחֶסֶד וּלְרַחֲמִים בְּעֵינֶיךָ וּבְעֵינֵי כָל רוֹאֵינוּ. וְתִשְׁמַע קוֹל תַּחֲנוּנֵינוּ, כִּי אֵל שׁוֹמֵעַ תְּפִלָּה וְתַחֲנוּן אָתָּה. בָּרוּךְ אַתָּה יְהוָה, שׁוֹמֵעַ תְּפִלָּה.`,
    transliteration: `Y'hi ratzon milfanecha Adonai Eloheinu v'Elohei avoteinu, shetolikheinu l'shalom v'tatz'ideinu l'shalom v'tadrikheinu l'shalom, v'tism'kheinu l'shalom, v'tagi'einu limchoz chef tzeinu l'chayim u'l'simchah u'l'shalom. V'tatzileinu mikaf kol oyev v'orev v'listim v'chayot ra'ot baderech, u'mikol minei pur'aniyot hamitrag'shot lavo la'olam. V'tishlach b'rachah b'chol ma'aseh yadeinu, v'tit'neinu l'chen u'l'chesed u'l'rachamim b'einecha u'v'einei chol ro'einu. V'tishma kol tachanuneinu, ki El shome'a t'filah v'tachanun ata. Baruch ata Adonai, shome'a t'filah.`
  },
  {
    id: "aleinu",
    order: 8,
    title: "Aleinu (First Paragraph)",
    label: "Aleinu",
    summary: "Praise God for setting us apart for sacred purpose.",
    category: "praise",
    english: `It is our duty to praise the Master of all, to ascribe greatness to the Author of creation, who has not made us like the nations of the lands, nor placed us like the families of the earth; who has not assigned our portion like theirs, nor our lot like all their multitude. For we bend the knee, bow down, and give thanks before the supreme King of kings, the Holy One, blessed be He.`,
    hebrew: `עָלֵינוּ לְשַׁבֵּחַ לַאֲדוֹן הַכֹּל, לָתֵת גְּדֻלָּה לְיוֹצֵר בְּרֵאשִׁית, שֶׁלֹּא עָשָׂנוּ כְּגוֹיֵי הָאֲרָצוֹת, וְלֹא שָׂמָנוּ כְּמִשְׁפְּחוֹת הָאֲדָמָה. שֶׁלֹּא שָׂם חֶלְקֵנוּ כָּהֶם, וְגוֹרָלֵנוּ כְּכָל הֲמוֹנָם. שֶׁאֲנַחְנוּ כּוֹרְעִים וּמִשְׁתַּחֲוִים וּמוֹדִים, לִפְנֵי מֶלֶךְ מַלְכֵי הַמְּלָכִים, הַקָּדוֹשׁ בָּרוּךְ הוּא.`,
    transliteration: `Aleinu l'shabe'ach la'adon hakol, latet g'dulah l'yotzer b'reishit, shelo asanu k'goyei ha'aratzot, v'lo samanu k'mishp'chot ha'adamah. Shelo sam chelkeinu kahem, v'goraleinu k'chol hamonam. She'anachnu kor'im u'mishtachavim u'modim, lifnei Melech malchei ham'lachim, haKadosh Baruch Hu.`
  },
  {
    id: "kaddish",
    order: 9,
    title: "Kaddish - Chatzi Kaddish",
    label: "Chatzi Kaddish",
    summary: "Traditionally recited with a minyan; provided here for personal study and reflection.",
    category: "sacred",
    english: `Magnified and sanctified be His great name (Cong: Amen) throughout the world which He has created according to His will. May He establish His kingdom in your lifetime and during your days, and within the life of the entire House of Israel, speedily and soon; and say, Amen.
(Cong: Amen. May His great name be blessed forever and to all eternity.)
May His great name be blessed forever and to all eternity.
Blessed and praised, glorified and exalted, extolled and honored, adored and lauded be the name of the Holy One, blessed be He (Cong: Amen), beyond all the blessings and hymns, praises and consolations that are uttered in the world; and say, Amen. (Cong: Amen)`,
    hebrew: `יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא. (קהל: אָמֵן)
בְּעָלְמָא דִּי בְרָא כִרְעוּתֵהּ וְיַמְלִיךְ מַלְכוּתֵהּ בְּחַיֵּיכוֹן וּבְיוֹמֵיכוֹן וּבְחַיֵּי דְכָל בֵּית יִשְׂרָאֵל בַּעֲגָלָא וּבִזְמַן קָרִיב, וְאִמְרוּ אָמֵן:
(קהל: אָמֵן יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא)
יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא:
יִתְבָּרַךְ וְיִשְׁתַּבַּח וְיִתְפָּאַר וְיִתְרוֹמַם וְיִתְנַשֵּׂא וְיִתְהַדָּר וְיִתְעַלֶּה וְיִתְהַלָּל שְׁמֵהּ דְּקֻדְשָׁא בְּרִיךְ הוּא. (קהל: אָמֵן)
לְעֵלָּא מִן כָּל בִּרְכָתָא וְשִׁירָתָא תֻּשְׁבְּחָתָא וְנֶחֱמָתָא דַּאֲמִירָן בְּעָלְמָא, וְאִמְרוּ אָמֵן: (קהל: אָמֵן)`,
    transliteration: `Yitgadal v'yitkadash sh'mei raba. (Cong: Amen)
B'alma di v'ra chirutei, v'yamlich malchutei b'chayeichon u'v'yomeichon u'v'chayei d'chol beit Yisrael, ba'agala u'vizman kariv, v'imru Amen.
(Cong: Amen. Y'hei sh'mei raba m'varach l'alam u'l'almei almaya.)
Y'hei sh'mei raba m'varach l'alam u'l'almei almaya.
Yitbarach v'yishtabach v'yitpa'ar v'yitromam v'yitnasei v'yit'hadar v'yit'aleh v'yit'halal sh'mei d'kudsha b'rich hu. (Cong: Amen)
L'eila min kol birchata v'shirata tushb'chata v'nechemata da'amiran b'alma, v'imru Amen. (Cong: Amen)`
  },
  {
    id: "adon-olam",
    order: 10,
    title: "Adon Olam (Master of the Universe)",
    label: "Adon Olam",
    summary: "Proclaim God\'s timeless sovereignty and personal protection.",
    category: "praise",
    english: `Master of the universe, who reigned before any form was created.
At the time when His will brought all into being, then was His name proclaimed King.
And after all things shall cease to be, He alone, the Awesome One, will reign.
He was, He is, and He shall be in glory.
He is One, and there is no second to compare to Him, to associate with Him.
Without beginning, without end, power and dominion are His.
He is my God, my living Redeemer, the Rock of my affliction in time of distress.
He is my banner and my refuge, the portion in my cup on the day I call.
Into His hand I entrust my spirit, when I sleep and when I wake.
And with my spirit, my body too; the Lord is with me, I shall not fear.`,
    hebrew: `אֲדוֹן עוֹלָם אֲשֶׁר מָלַךְ. בְּטֶרֶם כָּל יְצִיר נִבְרָא:
לְעֵת נַעֲשָׂה בְחֶפְצוֹ כֹּל. אֲזַי מֶלֶךְ שְׁמוֹ נִקְרָא:
וְאַחֲרֵי כִּכְלוֹת הַכֹּל. לְבַדּוֹ יִמְלֹךְ נוֹרָא:
וְהוּא הָיָה וְהוּא הֹוֶה. וְהוּא יִהְיֶה בְּתִפְאָרָה:
וְהוּא אֶחָד וְאֵין שֵׁנִי. לְהַמְשִׁיל לוֹ לְהַחְבִּירָה:
בְּלִי רֵאשִׁית בְּלִי תַכְלִית. וְלוֹ הָעֹז וְהַמִּשְׂרָה:
וְהוּא אֵלִי וְחַי גּוֹאֲלִי. וְצוּר חֶבְלִי בְּעֵת צָרָה:
וְהוּא נִסִּי וּמָנוֹס לִי. מְנָת כּוֹסִי בְּיוֹם אֶקְרָא:
בְּיָדוֹ אַפְקִיד רוּחִי. בְּעֵת אִישַׁן וְאָעִירָה:
וְעִם רוּחִי גְּוִיָּתִי. יְהוָה לִי וְלֹא אִירָא:`,
    transliteration: `Adon olam asher malach, b'terem kol y'tzir nivra.
L'eit na'asah v'cheftzo kol, azai Melech sh'mo nikra.
V'acharei kichlot hakol, l'vado yimloch nora.
V'hu haya v'hu hoveh, v'hu yihyeh b'tifarah.
V'hu echad v'ein sheni, l'hamshil lo l'hachbirah.
B'li reishit b'li tachlit, v'lo ha'oz v'ha'misrah.
V'hu Eli v'chai go'ali, v'tzur chevli b'eit tzarah.
V'hu nisi u'manos li, m'nat kosi b'yom ekra.
B'yado afkid ruchi, b'eit ishan v'a'irah.
V'im ruchi g'viyati, Adonai li v'lo ira.`
  },
  {
    id: "ein-keloheinu",
    order: 11,
    title: "Ein Keloheinu (There is None Like Our God)",
    label: "Ein Keloheinu",
    summary: "Call-and-response style praise for God's uniqueness.",
    category: "praise",
    english: `There is none like our God; there is none like our Lord; there is none like our King; there is none like our Savior.
Who is like our God? Who is like our Lord? Who is like our King? Who is like our Savior?
Let us thank our God; let us thank our Lord; let us thank our King; let us thank our Savior.
You are our God; You are our Lord; You are our King; You are our Savior.
You are He before whom our fathers burned the incense offering.`,
    hebrew: `אֵין כֵּאלֹהֵינוּ. אֵין כַּאדוֹנֵנוּ. אֵין כְּמַלְכֵּנוּ. אֵין כְּמוֹשִׁיעֵנוּ:
מִי כֵאלֹהֵינוּ. מִי כַאדוֹנֵנוּ. מִי כְמַלְכֵּנוּ. מִי כְמוֹשִׁיעֵנוּ:
נוֹדֶה לֵאלֹהֵינוּ. נוֹדֶה לַאדוֹנֵנוּ. נוֹדֶה לְמַלְכֵּנוּ. נוֹדֶה לְמוֹשִׁיעֵנוּ:
אַתָּה הוּא אֱלֹהֵינוּ. אַתָּה הוּא אֲדוֹנֵנוּ. אַתָּה הוּא מַלְכֵּנוּ. אַתָּה הוּא מוֹשִׁיעֵנוּ:
אַתָּה הוּא שֶׁהִקְטִירוּ אֲבוֹתֵינוּ לְפָנֶיךָ אֶת קְטֹרֶת הַסַּמִּים:`,
    transliteration: `Ein Keloheinu, ein kadoneinu, ein k'malkeinu, ein k'moshi'einu.
Mi Cheloheinu, mi chadoneinu, mi ch'malkeinu, mi ch'moshi'einu.
Nodeh Leloheinu, nodeh ladoneinu, nodeh l'malkeinu, nodeh l'moshi'einu.
Atah hu Eloheinu, ata hu Adoneinu, ata hu Malkeinu, ata hu Moshi'einu.
Atah hu shehiktiru avoteinu l'fanecha et k'toret hasamim.`
  },
  {
    id: "ashrei",
    order: 12,
    title: "Ashrei",
    label: "Ashrei",
    summary: "Psalm 145 with introductory verses, exalting God's kindness in every generation.",
    category: "praise",
    english: `(Psalm 84:5) Happy are those who dwell in Your house; they will yet praise You! Selah.
(Psalm 144:15) Happy is the people for whom this is so; happy is the people whose God is the Lord.
(Psalm 145 - Acrostic)
(Aleph) I will exalt You, my God the King, and bless Your name forever and ever.
(Bet) Every day I will bless You, and praise Your name forever and ever.
(Gimel) Great is the Lord and highly praised; His greatness is beyond search.
(Dalet) One generation shall praise Your works to another, and declare Your mighty acts.
(Heh) I will speak of the glorious splendor of Your majesty, and tell of Your wondrous works.
(Vav) They shall speak of the might of Your awesome acts, and I will recount Your greatness.
(Zayin) They shall express the memory of Your abundant goodness, and sing joyfully of Your righteousness.
(Chet) The Lord is gracious and compassionate, slow to anger and great in lovingkindness.
(Tet) The Lord is good to all, and His compassion is over all His works.
(Yod) All Your works shall thank You, Lord, and Your faithful ones shall bless You.
(Kaf) They shall speak of the glory of Your kingdom, and talk of Your might.
(Lamed) To make known Your mighty acts to the children of men, and the glorious splendor of Your kingdom.
(Mem) Your kingdom is an everlasting kingdom, and Your dominion endures throughout all generations.
(Samech) The Lord supports all who fall, and straightens all who are bent.
(Ayin) The eyes of all look hopefully to You, and You give them their food in its proper time.
(Peh) You open Your hand and satisfy the desire of every living thing.
(Tzadi) The Lord is righteous in all His ways, and kind in all His deeds.
(Kuf) The Lord is near to all who call upon Him, to all who call upon Him in truth.
(Resh) He fulfills the desire of those who fear Him; He hears their cry and saves them.
(Shin) The Lord protects all who love Him, but all the wicked He will destroy.
(Tav) My mouth shall speak the praise of the Lord, and all flesh shall bless His holy name forever and ever.
(End Verse) And we will bless the Lord from this time forth and forever. Hallelujah!`,
    hebrew: `(תהלים פד:ה) אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ עוֹד יְהַלְלוּךָ סֶּלָה:
(תהלים קמד:טו) אַשְׁרֵי הָעָם שֶׁכָּכָה לּוֹ אַשְׁרֵי הָעָם שֶׁיֲהוָה אֱלֹהָיו:
(תהלים קמה - אקרוסטיכון)
(א) תְּהִלָּה לְדָוִד. אֲרוֹמִמְךָ אֱלוֹהַי הַמֶּלֶךְ וַאֲבָרְכָה שִׁמְךָ לְעוֹלָם וָעֶד:
(ב) בְּכָל יוֹם אֲבָרְכֶךָּ וַאֲהַלְלָה שִׁמְךָ לְעוֹלָם וָעֶד:
(ג) גָּדוֹל יְהוָה וּמְהֻלָּל מְאד וְלִגְדֻלָּתוֹ אֵין חֵקֶר:
(ד) דּוֹר לְדוֹר יְשַׁבַּח מַעֲשיךָ וּגְבוּרתֶיךָ יַגִּידוּ:
(ה) הֲדַר כְּבוֹד הוֹדֶךָ וְדִבְרֵי נִפְלְאתֶיךָ אָשיחָה:
(ו) וֶעֱזוּז נוֹרְאתֶיךָ יאמֵרוּ וּגְדֻלָּתְךָ אֲסַפְּרֶנָּה:
(ז) זֵכֶר רַב טוּבְךָ יַבִּיעוּ וְצִדְקָתְךָ יְרַנֵּנוּ:
(ח) חַנּוּן וְרַחוּם יְהוָה אֶרֶךְ אַפַּיִם וּגְדָל חָסֶד:
(ט) טוֹב יְהוָה לַכּל וְרַחֲמָיו עַל כָּל מַעֲשיו:
(י) יוֹדוּךָ יְהוָה כָּל מַעֲשיךָ וַחֲסִידֶיךָ יְבָרְכוּכָה:
(כ) כְּבוֹד מַלְכוּתְךָ יאמֵרוּ וּגְבוּרָתְךָ יְדַבֵּרוּ:
(ל) לְהוֹדִיעַ לִבְנֵי הָאָדָם גְּבוּרתָיו וּכְבוֹד הֲדַר מַלְכוּתוֹ:
(מ) מַלְכוּתְךָ מַלְכוּת כָּל עלָמִים וּמֶמְשַׁלְתְּךָ בְּכָל דּוֹר וָדוֹר:
(ס) סוֹמֵךְ יְהוָה לְכָל הַנּפְלִים וְזוֹקֵף לְכָל הַכְּפוּפִים:
(ע) עֵינֵי כל אֵלֶיךָ יְשבֵּרוּ וְאַתָּה נוֹתֵן לָהֶם אֶת אָכְלָם בְּעִתּוֹ:
(פ) פּוֹתֵחַ אֶת יָדֶךָ וּמַשבִּיעַ לְכָל חַי רָצוֹן:
(צ) צַדִּיק יְהוָה בְּכָל דְּרָכָיו וְחָסִיד בְּכָל מַעֲשיו:
(ק) קָרוֹב יְהוָה לְכָל קרְאָיו לְכל אֲשֶׁר יִקְרָאֻהוּ בֶאֱמֶת:
(ר) רְצוֹן יְרֵאָיו יַעֲשה וְאֶת שַׁוְעָתָם יִשְׁמַע וְיוֹשִׁיעֵם:
(ש) שׁוֹמֵר יְהוָה אֶת כָּל אהֲבָיו וְאֵת כָּל הָרְשָׁעִים יַשְׁמִיד:
(ת) תְּהִלַּת יְהוָה יְדַבֶּר פִּי וִיבָרֵךְ כָּל בָּשר שֵׁם קָדְשׁוֹ לְעוֹלָם וָעֶד:
(סיום) וַאֲנַחְנוּ נְבָרֵךְ יָהּ מֵעַתָּה וְעַד עוֹלָם הַלְלוּיָהּ:`,
    transliteration: `(Ps 84:5) Ashrei yoshvei veitecha, od y'hal'lucha selah.
(Ps 144:15) Ashrei ha'am shekachah lo, ashrei ha'am she'Adonai Elohav.
(Ps 145)
(Aleph) T'hilah l'David. Aromimcha Elohai ha'melech, va'avarcha shimcha l'olam va'ed.
(Bet) B'chol yom avarcheka, va'ahal'lah shimcha l'olam va'ed.
(Gimel) Gadol Adonai u'm'hulal m'od, v'ligdulato ein cheker.
(Dalet) Dor l'dor y'shabach ma'asecha, u'gvurotecha yagidu.
(Heh) Hadar k'vod hodecha, v'divrei nifl'otecha asichah.
(Vav) Ve'ezuz nor'otecha yomeru, u'gdulatcha asaprena.
(Zayin) Zecher rav tuvcha yabiu, v'tzidkatcha y'ranenu.
(Chet) Chanun v'rachum Adonai, erech apayim u'g'dal chased.
(Tet) Tov Adonai lakol, v'rachamav al kol ma'asav.
(Yod) Yoducha Adonai kol ma'asecha, va'chasid'cha y'varchucha.
(Kaf) K'vod malchutcha yomeru, u'gvuratcha y'daberu.
(Lamed) L'hodia livnei ha'adam g'vurotav, u'chvod hadar malchuto.
(Mem) Malchutcha malchut kol olamim, u'memshalt'cha b'chol dor va'dor.
(Samech) Somech Adonai l'chol hanoflim, v'zokef l'chol hakfufim.
(Ayin) Einei chol eilecha y'saberu, v'atah noten lahem et ochlam b'ito.
(Peh) Pote'ach et yadecha, u'masbia l'chol chai ratzon.
(Tzadi) Tzadik Adonai b'chol d'rachav, v'chasid b'chol ma'asav.
(Kuf) Karov Adonai l'chol kor'av, l'chol asher yikra'uhu ve'emet.
(Resh) R'tzon y're'av ya'aseh, v'et shav'atam yishma v'yoshi'em.
(Shin) Shomer Adonai et kol ohavav, v'et kol har'sha'im yashmid.
(Tav) T'hilat Adonai y'daber pi, vivarech kol basar shem kodsho l'olam va'ed.
(End Verse) Va'anachnu n'varech Yah, me'atah v'ad olam, Halleluyah.`
  },
  {
    id: "anim-zemirot",
    order: 13,
    title: "An'im Zemirot (Hymn of Glory) - Excerpt",
    label: "An'im Zemirot",
    summary: "Five-stanza meditative praise often sung toward the conclusion of services.",
    category: "praise",
    english: `I shall compose pleasant psalms and weave songs, for my soul longs for You.
My soul desires the shelter of Your hand, to know all Your secret mysteries.
Each time I speak of Your glory, my heart yearns for Your love.
Therefore I shall speak glorious things of You, and Your name I shall honor with songs of love.
I shall tell of Your glory though I have not seen You; I shall describe You, though I have not known You.`,
    hebrew: `אַנְעִים זְמִירוֹת וְשִׁירִים אֶאֱרֹג. כִּי אֵלֶיךָ נַפְשִׁי תַעֲרֹג:
נַפְשִׁי חָמְדָה בְצֵל יָדֶךָ. לָדַעַת כָּל רָז סוֹדֶךָ:
מִדֵּי דַבְּרִי בִכְבוֹדֶךָ. הוֹמֶה לִבִּי אֶל דוֹדֶיךָ:
עַל כֵּן אֲדַבֵּר בְּךָ נִכְבָּדוֹת. וְשִׁמְךָ אֲכַבֵּד בְּשִׁירֵי יְדִידוֹת:
אַסַפְּרָה כְבוֹדְךָ וְלֹא רְאִיתִיךָ. אֲדַמְּךָ אַכַּנְּךָ וְלֹא יְדַעְתִּיךָ:`,
    transliteration: `An'im z'mirot v'shirim e'erog, ki eilecha nafshi ta'arog.
Nafshi chamdah b'tzel yadecha, lada'at kol raz sodecha.
Midei dab'ri bichvodecha, homeh libi el dodecha.
Al ken adaber b'cha nichbadot, v'shimcha achabed b'shirei y'didot.
Asaprah chvod'cha v'lo r'iticha, adam'cha achan'cha v'lo y'daticha.`
  },
  {
    id: "yigdal",
    order: 14,
    title: "Yigdal",
    label: "Yigdal",
    summary: "Poetic rendering of Maimonides' Thirteen Principles of Faith.",
    category: "praise",
    english: `Magnified and praised be the living God; He exists, His existence transcends time.
He is One, and there is no unity like His; He is unknowable, His unity is endless.
He has no semblance of a body, He is incorporeal; His holiness is beyond comparison.
He preceded every being that was created; He is the first, and nothing preceded Him.
Behold! He is Master of the universe; every creature proclaims His greatness and His sovereignty.
He granted His abundant prophecy to His treasured, splendorous people.
In Israel, none like Moses arose again, a prophet who perceived His vision clearly.
God gave His people a Torah of truth, by the hand of His prophet, the most trusted of His household.
God will never amend nor exchange His law for any other one, for all eternity.
He scrutinizes and knows our hidden secrets; He perceives the end of a matter at its beginning.
He rewards a person with kindness according to his deed; He places evil on the wicked according to his wickedness.
He will send us our Messiah at the End of Days, to redeem those waiting for His final salvation.
God, in His great kindness, will resurrect the dead; Blessed forever is His praised name.`,
    hebrew: `יִגְדַּל אֱלֹהִים חַי וְיִשְׁתַּבַּח. נִמְצָא וְאֵין עֵת אֶל מְצִיאוּתוֹ:
אֶחָד וְאֵין יָחִיד כְּיִחוּדוֹ. נֶעְלָם וְגַם אֵין סוֹף לְאַחְדּוּתוֹ:
אֵין לוֹ דְמוּת הַגּוּף וְאֵינוֹ גוּף. לֹא נַעֲרוֹךְ אֵלָיו קְדֻשָּׁתוֹ:
קַדְמוֹן לְכָל דָּבָר אֲשֶׁר נִבְרָא. רִאשׁוֹן וְאֵין רֵאשִׁית לְרֵאשִׁיתוֹ:
הִנּוֹ אֲדוֹן עוֹלָם לְכָל נוֹצָר. יוֹרֶה גְדֻלָּתוֹ וּמַלְכוּתוֹ:
שֶׁפַע נְבוּאָתוֹ נְתָנוֹ. אֶל אַנְשֵׁי סְגֻלָּתוֹ וְתִפְאַרְתּוֹ:
לֹא קָם בְּיִשְׂרָאֵל כְּמשֶׁה עוֹד. נָבִיא וּמַבִּיט אֶת תְּמוּנָתוֹ:
תּוֹרַת אֱמֶת נָתַן לְעַמּוֹ אֵל. עַל יַד נְבִיאוֹ נֶאֱמַן בֵּיתוֹ:
לֹא יַחֲלִיף הָאֵל וְלֹא יָמִיר דָּתוֹ. לְעוֹלָמִים לְזוּלָתוֹ:
צוֹפֶה וְיוֹדֵעַ סְתָרֵינוּ. מַבִּיט לְסוֹף דָּבָר בְּקַדְמָתוֹ:
גּוֹמֵל לְאִישׁ חֶסֶד כְּמִפְעָלוֹ. נוֹתֵן לְרָשָׁע רָע כְּרִשְׁעָתוֹ:
יִשְׁלַח לְקֵץ יָמִין מְשִׁיחֵנוּ. לִפְדּוֹת מְחַכֵּי קֵץ יְשׁוּעָתוֹ:
מֵתִים יְחַיֶּה אֵל בְּרֹב חַסְדוֹ. בָּרוּךְ עֲדֵי עַד שֵׁם תְּהִלָּתוֹ:`,
    transliteration: `Yigdal Elohim chai v'yishtabach, nimtza v'ein et el m'tziuto.
Echad v'ein yachid k'yichudo, ne'elam v'gam ein sof l'achduto.
Ein lo d'mut haguf v'eino guf, lo na'aroch eilav k'dushato.
Kadmon l'chol davar asher nivra, rishon v'ein reishit l'reishito.
Hino Adon olam l'chol notzar, yoreh g'dulato u'malchuto.
Shefa n'vuato n'tano, el anshei s'gulato v'tifarto.
Lo kam b'Yisrael k'Moshe od, navi u'mabit et t'munato.
Torat emet natan l'amo El, al yad n'vio ne'eman beito.
Lo yachalif ha'El v'lo yamir dato, l'olamim l'zulato.
Tzofeh v'yode'a s'tareinu, mabit l'sof davar b'kadmato.
Gomel l'ish chesed k'mifalo, noten l'rasha ra k'rishato.
Yishlach l'ketz yamin m'shicheinu, lifdot m'chakei ketz y'shuato.
Metim y'chayeh El b'rov chasdo, baruch adei ad shem t'hilato.`
  },
  {
    id: "birkat-hatorah",
    order: 15,
    title: "Blessing over the Torah (Birkat HaTorah) - Before & After",
    label: "Birkat HaTorah",
    summary: "Recite before and after engaging with Torah to acknowledge the gift of its wisdom.",
    category: "daily",
    english: `(Before Reading)
Bless the Lord who is to be blessed.
(Cong: Blessed be the Lord who is to be blessed forever and ever.)
Blessed are You, Lord our God, King of the universe, who has chosen us from all peoples and given us His Torah. Blessed are You, Lord, giver of the Torah.

(After Reading)
Blessed are You, Lord our God, King of the universe, who has given us the Torah of truth and planted eternal life within us. Blessed are You, Lord, giver of the Torah.`,
    hebrew: `(לפני הקריאה)
בָּרְכוּ אֶת יְהוָה הַמְבֹרָךְ:
(קהל: בָּרוּךְ יְהוָה הַמְבֹרָךְ לְעוֹלָם וָעֶד:)
בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר בָּחַר בָּנוּ מִכָּל הָעַמִּים וְנָתַן לָנוּ אֶת תּוֹרָתוֹ. בָּרוּךְ אַתָּה יְהוָה, נוֹתֵן הַתּוֹרָה:

(אחרי הקריאה)
בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר נָתַן לָנוּ תּוֹרַת אֱמֶת וְחַיֵּי עוֹלָם נָטַע בְּתוֹכֵנוּ. בָּרוּךְ אַתָּה יְהוָה, נוֹתֵן הַתּוֹרָה:`,
    transliteration: `(Before Reading)
Barchu et Adonai ha'm'vorach.
(Cong: Baruch Adonai ha'm'vorach l'olam va'ed.)
Baruch ata Adonai Eloheinu Melech ha'olam, asher bachar banu mikol ha'amim v'natan lanu et Torato. Baruch ata Adonai, noten haTorah.

(After Reading)
Baruch ata Adonai Eloheinu Melech ha'olam, asher natan lanu Torat emet v'chayei olam nata b'tochenu. Baruch ata Adonai, noten haTorah.`
  },
  {
    id: "havdalah",
    order: 16,
    title: "Havdalah Blessings",
    label: "Havdalah",
    summary: "Close Shabbat with verses of reassurance and the four Havdalah blessings.",
    category: "sacred",
    english: `Behold, God is my salvation; I will trust and not fear, for the Lord God is my strength and song, and He has become my salvation. Joyfully shall you draw water from the wells of salvation. Salvation is the Lord's; upon Your people is Your blessing. The Lord of Hosts is with us; the God of Jacob is our stronghold. Lord of Hosts, happy is the person who trusts in You. Lord, save! May the King answer us on the day we call.
For the Jews there was light, joy, gladness, and honor. So may it be for us.
I will raise the cup of salvation and call upon the name of the Lord.

Blessed are You, Lord our God, King of the universe, who creates the fruit of the vine.
Blessed are You, Lord our God, King of the universe, who creates the species of spices.
Blessed are You, Lord our God, King of the universe, who creates the lights of fire.
Blessed are You, Lord our God, King of the universe, who separates between holy and profane, between light and darkness, between Israel and the nations, between the seventh day and the six days of labor. Blessed are You, Lord, who separates between holy and profane.`,
    hebrew: `הִנֵּה אֵל יְשׁוּעָתִי; אֶבְטַח וְלֹא אֶפְחָד, כִּי עָזִּי וְזִמְרָת יָהּ יְהוָה וַיְהִי לִי לִישׁוּעָה. וּשְׁאַבְתֶּם מַיִם בְּשָׂשׂוֹן מִמַּעַיְנֵי הַיְשׁוּעָה. לַיהוָה הַיְשׁוּעָה, עַל עַמְּךָ בִרְכָתְךָ סֶּלָה. יְהוָה צְבָאוֹת עִמָּנוּ; מִשְׂגָּב לָנוּ אֱלֹהֵי יַעֲקב סֶּלָה. יְהוָה צְבָאוֹת, אַשְׁרֵי אָדָם בֹּטֵחַ בָּךְ. יְהוָה הוֹשִׁיעָה; הַמֶּלֶךְ יַעֲנֵנוּ בְיוֹם קָרְאֵנוּ.
לַיְּהוּדִים הָיְתָה אוֹרָה וְשִׂמְחָה וְשָׂשׂוֹן וִיקָר; כֵּן תִּהְיֶה לָנוּ.
כּוֹס יְשׁוּעוֹת אֶשָּׂא, וּבְשֵׁם יְהוָה אֶקְרָא.

בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא פְּרִי הַגָּפֶן.
בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא מִינֵי בְשָׂמִים.
בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא מְאוֹרֵי הָאֵשׁ.
בָּרוּךְ אַתָּה יְהוָה אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, הַמַּבְדִּיל בֵּין קֹדֶשׁ לְחוֹל, בֵּין אוֹר לְחֹשֶׁךְ, בֵּין יִשְׂרָאֵל לָעַמִּים, בֵּין יוֹם הַשְּׁבִיעִי לְשֵׁשֶׁת יְמֵי הַמַּעֲשֶׂה. בָּרוּךְ אַתָּה יְהוָה, הַמַּבְדִּיל בֵּין קֹדֶשׁ לְחוֹל.`,
    transliteration: `Hinei El y'shu'ati; evtach v'lo efchad, ki ozi v'zimrat Yah Adonai vayehi li lishu'ah. Ush'avtem mayim b'sason mimay'nei hay'shu'ah. LaAdonai hay'shu'ah, al amcha birchatecha selah. Adonai Tzeva'ot imanu; misgav lanu Elohei Yaakov selah. Adonai Tzeva'ot, ashrei adam boteach bach. Adonai hoshia; haMelech ya'aneinu v'yom kareinu.
LaYehudim hayetah orah v'simchah v'sasson vikar; kein tihyeh lanu.
Kos y'shuot esa, u'veshem Adonai ekra.

Baruch ata Adonai Eloheinu Melech ha'olam, borei p'ri hagafen.
Baruch ata Adonai Eloheinu Melech ha'olam, borei minei v'samim.
Baruch ata Adonai Eloheinu Melech ha'olam, borei m'orei ha'esh.
Baruch ata Adonai Eloheinu Melech ha'olam, hamavdil bein kodesh lechol, bein or lechoshech, bein Yisrael la'amim, bein yom hashvi'i l'sheshet yemei hama'aseh. Baruch ata Adonai, hamavdil bein kodesh lechol.`
  },
  {
    id: "psalm-23",
    order: 17,
    title: "Psalm 23 - Mizmor L'David",
    label: "Mizmor L'David",
    summary: "Beloved psalm of trust and comfort — \"The Lord is my shepherd.\"",
    category: "healing",
    english: `A Psalm of David.
The Lord is my shepherd; I shall not want.
He makes me lie down in green pastures; He leads me beside still waters.
He restores my soul; He guides me in straight paths for His name's sake.
Though I walk through the valley of the shadow of death, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me.
You prepare a table before me in the presence of my enemies; You anoint my head with oil; my cup overflows.
Surely goodness and kindness shall follow me all the days of my life, and I shall dwell in the house of the Lord forever.`,
    hebrew: `מִזְמוֹר לְדָוִד. יְהוָה רֹעִי לֹא אֶחְסָר.
בִּנְאוֹת דֶּשֶׁא יַרְבִּיצֵנִי. עַל מֵי מְנֻחוֹת יְנַהֲלֵנִי.
נַפְשִׁי יְשׁוֹבֵב. יַנְחֵנִי בְמַעְגְּלֵי צֶדֶק לְמַעַן שְׁמוֹ.
גַּם כִּי אֵלֵךְ בְּגֵיא צַלְמָוֶת לֹא אִירָא רָע כִּי אַתָּה עִמָּדִי. שִׁבְטְךָ וּמִשְׁעַנְתֶּךָ הֵמָּה יְנַחֲמֻנִי.
תַּעֲרֹךְ לְפָנַי שֻׁלְחָן נֶגֶד צֹרְרָי. דִּשַּׁנְתָּ בַשֶּׁמֶן רֹאשִׁי. כּוֹסִי רְוָיָה.
אַךְ טוֹב וָחֶסֶד יִרְדְּפוּנִי כָּל יְמֵי חַיָּי. וְשַׁבְתִּי בְּבֵית יְהוָה לְאֹרֶךְ יָמִים.`,
    transliteration: `Mizmor l'David. Adonai ro'i lo echsar.
Bin'ot deshe yarbitzeini. Al mei m'nuchot y'nahaleini.
Nafshi y'shovev. Yancheni v'ma'aglei tzedek l'ma'an sh'mo.
Gam ki eilech b'gei tzalmavet lo ira ra ki ata imadi. Shivt'cha u'mishantecha hemah y'nachamuni.
Ta'aroch lefanai shulchan neged tzorerai. Dishanta vashemen roshi. Kosi revayah.
Ach tov vachesed yird'funi kol y'mei chayai. V'shavti b'beit Adonai l'orech yamim.`
  }
];

const PRAYER_CATEGORIES = [
  {
    id: "daily",
    title: "Daily Foundations",
    description: "Morning gratitude and Torah-centered commitments for every day.",
    links: [
      { id: "modeh-ani", label: "Modeh Ani" },
      { id: "shema", label: "Shema Yisrael" },
      { id: "birkat-hatorah", label: "Birkat HaTorah" }
    ]
  },
  {
    id: "amidah",
    title: "Amidah Moments",
    description: "Key sections you can focus on when davening privately.",
    links: [
      { id: "amidah-first", label: "Opening 3 Blessings" },
      { id: "amidah-refaeinu", label: "Refa'einu (Healing)" },
      { id: "amidah-last", label: "Closing 3 Blessings" }
    ]
  },
  {
    id: "healing",
    title: "Healing & Comfort",
    description: "Prayers for the sick, strength, and calm of the soul.",
    links: [
      { id: "mi-sheberach", label: "Mi Sheberach" },
      { id: "amidah-refaeinu", label: "Amidah – Refa'einu" },
      { id: "psalm-23", label: "Psalm Mizmor L'David" }
    ]
  },
  {
    id: "protection",
    title: "Journeys & Protection",
    description: "Ask for guidance and blessing when traveling or closing Shabbat.",
    links: [
      { id: "tefilat-haderech", label: "Tefilat HaDerech" },
      { id: "psalm-23", label: "Psalm Mizmor L'David" },
      { id: "havdalah", label: "Havdalah Blessings" }
    ]
  },
  {
    id: "praise",
    title: "Praise & Faith",
    description: "Songs that anchor faith through praise and poetry.",
    links: [
      { id: "aleinu", label: "Aleinu" },
      { id: "adon-olam", label: "Adon Olam" },
      { id: "ein-keloheinu", label: "Ein Keloheinu" },
      { id: "ashrei", label: "Ashrei" },
      { id: "anim-zemirot", label: "An'im Zemirot" },
      { id: "yigdal", label: "Yigdal" }
    ]
  },
  {
    id: "sacred",
    title: "Sacred Moments",
    description: "Texts for transition times and mindful remembrance.",
    links: [
      { id: "kaddish", label: "Chatzi Kaddish" },
      { id: "havdalah", label: "Havdalah Blessings" }
    ]
  }
];

if (typeof window !== "undefined") {
  window.PRAYER_DATA = PRAYER_DATA;
  window.PRAYER_CATEGORIES = PRAYER_CATEGORIES;
}
