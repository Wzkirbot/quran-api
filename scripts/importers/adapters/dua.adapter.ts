import fs from 'node:fs';
import path from 'node:path';
import { DuaItem } from '../../../src/types/index.js';
import { normalizeArabicForSearch } from '../../../src/utils/arabicNormalizer.js';
import { writeManifest } from '../manifest-generator.js';

export async function importDuaData(): Promise<{ totalDuas: number }> {
  console.log('⏳ Starting Dua Dataset Ingestion & Validation...');

  const dataDir = path.resolve(process.cwd(), 'data/dua');
  fs.mkdirSync(dataDir, { recursive: true });

  const rawDuas: Array<Omit<DuaItem, 'text_simple'>> = [
    // Quranic Duas (أدعية قرآنية)
    {
      id: 1,
      category: 'quranic',
      title_ar: 'دعاء جامع لخير الدنيا والآخرة والوقاية من النار',
      text_ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      translation_en: 'Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.',
      source: 'سورة البقرة [الآية: 201]'
    },
    {
      id: 2,
      category: 'quranic',
      title_ar: 'دعاء الثبات على الهداية بعد الإيمان',
      text_ar: 'رَبَّنَا لاَ تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ',
      translation_en: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower.',
      source: 'سورة آل عمران [الآية: 8]'
    },
    {
      id: 3,
      category: 'quranic',
      title_ar: 'دعاء الصبر والنصر والتثبيت',
      text_ar: 'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
      translation_en: 'Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.',
      source: 'سورة البقرة [الآية: 250]'
    },
    {
      id: 4,
      category: 'quranic',
      title_ar: 'دعاء المغفرة والرحمة والاعتراف بالذنب (دعاء آدم وحواء)',
      text_ar: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
      translation_en: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
      source: 'سورة الأعراف [الآية: 23]'
    },
    {
      id: 5,
      category: 'quranic',
      title_ar: 'دعاء يونس عليه السلام في بطن الحوت (كشف الكرب والغم)',
      text_ar: 'لَّا إِلَـٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
      translation_en: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
      source: 'سورة الأنبياء [الآية: 87]'
    },
    {
      id: 6,
      category: 'quranic',
      title_ar: 'دعاء شرح الصدر وتيسير الأمر وفصاحة اللسان (دعاء موسى)',
      text_ar: 'رَبِّ اشْرَحْ لِي صَدْرِي * وَيَسِّرْ لِي أَمْرِي * وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي * يَفْقَهُوا قَوْلِي',
      translation_en: 'My Lord, expand for me my breast, and ease for me my task, and untie the knot from my tongue that they may understand my speech.',
      source: 'سورة طه [الآيات: 25-28]'
    },
    {
      id: 7,
      category: 'quranic',
      title_ar: 'دعاء طلب الذرية الصالحة (دعاء زكريا)',
      text_ar: 'رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً إِنَّكَ سَمِيعُ الدُّعَاءِ',
      translation_en: 'My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication.',
      source: 'سورة آل عمران [الآية: 38]'
    },
    {
      id: 8,
      category: 'quranic',
      title_ar: 'دعاء صلاح الزوج والذرية وقرة الأعين',
      text_ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      translation_en: 'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us a leader for the righteous.',
      source: 'سورة الفرقان [الآية: 74]'
    },
    {
      id: 9,
      category: 'quranic',
      title_ar: 'دعاء بر الوالدين والرحمة بهما',
      text_ar: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
      translation_en: 'My Lord, have mercy upon them as they brought me up when I was small.',
      source: 'سورة الإسراء [الآية: 24]'
    },
    {
      id: 10,
      category: 'quranic',
      title_ar: 'دعاء طلب الزيادة في العلم',
      text_ar: 'رَّبِّ زِدْنِي عِلْمًا',
      translation_en: 'My Lord, increase me in knowledge.',
      source: 'سورة طه [الآية: 114]'
    },

    // Prophetic Duas (أدعية نبوية مأثورة)
    {
      id: 11,
      category: 'prophetic',
      title_ar: 'دعاء تفريج الهم والغم والحزن وقضاء الدين',
      text_ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
      translation_en: 'O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from miserliness and cowardice, from being overcome by debt and overpowered by men.',
      source: 'صحيح البخاري (رقم 2893)'
    },
    {
      id: 12,
      category: 'prophetic',
      title_ar: 'دعاء سؤال الهدى والتقى والعفاف والغنى',
      text_ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى، وَالتُّقَى، وَالْعَفَافَ، وَالْغِنَى',
      translation_en: 'O Allah, I ask You for guidance, piety, chastity and self-sufficiency.',
      source: 'صحيح مسلم (رقم 2721)'
    },
    {
      id: 13,
      category: 'prophetic',
      title_ar: 'دعاء تثبيت القلوب على طاعة الله ودينه',
      text_ar: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
      translation_en: 'O Turner of the hearts, make my heart firm upon Your religion.',
      source: 'سنن الترمذي وصححه الألباني'
    },
    {
      id: 14,
      category: 'prophetic',
      title_ar: 'دعاء الاستخارة في سائر الأمور',
      text_ar: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الْغُيُوبِ...',
      translation_en: 'O Allah, I seek Your counsel by Your knowledge, and by Your power I seek capability and I ask You for Your great favor...',
      source: 'صحيح البخاري (رقم 1162)'
    },
    {
      id: 15,
      category: 'prophetic',
      title_ar: 'دعاء العفو والمغفرة (دعاء ليلة القدر)',
      text_ar: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
      translation_en: 'O Allah, You are Pardoning, You love to pardon, so pardon me.',
      source: 'سنن الترمذي وصححه الألباني'
    }
  ];

  const duasList: DuaItem[] = rawDuas.map((item) => ({
    ...item,
    text_simple: normalizeArabicForSearch(item.text_ar)
  }));

  // Write duas.json
  const duasJson = JSON.stringify(duasList, null, 2);
  const duasPath = path.join(dataDir, 'duas.json');
  fs.writeFileSync(duasPath, duasJson, 'utf-8');
  console.log(`✅ Saved ${duasList.length} Dua records to ${duasPath}`);

  // Write manifest.json
  const manifest = writeManifest(
    dataDir,
    {
      dataset: 'quranic_and_prophetic_duas',
      version: '1.0.0',
      source: 'The Holy Quran & Sahih Hadith Collections (Bukhari, Muslim, Tirmidhi)',
      license: 'Public Domain / Free for Non-Commercial & Educational Distribution',
      recordsCount: duasList.length,
      attribution: 'Authentic Quranic Rabbana prayers and Prophetic supplications with exact references.'
    },
    duasJson
  );

  console.log(`🔒 Dua Checksum (SHA-256): ${manifest.checksum}`);
  return { totalDuas: duasList.length };
}
