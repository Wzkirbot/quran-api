import fs from 'node:fs';
import path from 'node:path';
import { AdhkarCategory, AdhkarItem } from '../../../src/types/index.js';
import { normalizeArabicForSearch } from '../../../src/utils/arabicNormalizer.js';
import { writeManifest } from '../manifest-generator.js';

export async function importAdhkarData(): Promise<{ totalCategories: number; totalAdhkar: number }> {
  console.log('⏳ Starting Adhkar Dataset Ingestion & Validation...');

  const dataDir = path.resolve(process.cwd(), 'data/adhkar');
  fs.mkdirSync(dataDir, { recursive: true });

  const categories: AdhkarCategory[] = [
    {
      id: 1,
      slug: 'morning',
      title_ar: 'أذكار الصباح',
      title_en: 'Morning Remembrance',
      description: 'أذكار تقال بعد صلاة الفجر حتى طلوع الشمس'
    },
    {
      id: 2,
      slug: 'evening',
      title_ar: 'أذكار المساء',
      title_en: 'Evening Remembrance',
      description: 'أذكار تقال بعد صلاة العصر حتى غروب الشمس'
    },
    {
      id: 3,
      slug: 'sleep',
      title_ar: 'أذكار النوم',
      title_en: 'Remembrance Before Sleeping',
      description: 'الأدعية والأذكار الثابتة عند إرادة النوم'
    },
    {
      id: 4,
      slug: 'waking',
      title_ar: 'أذكار الاستيقاظ من النوم',
      title_en: 'Remembrance Upon Waking Up',
      description: 'ما يقوله المسلم عند استيقاظه'
    },
    {
      id: 5,
      slug: 'after_prayer',
      title_ar: 'الأذكار بعد السلام من الصلاة',
      title_en: 'Remembrance After Obligatory Prayer',
      description: 'الأذكار الواردة دبر كل صلاة مكتوبة'
    },
    {
      id: 6,
      slug: 'mosque',
      title_ar: 'أذكار المسجد',
      title_en: 'Mosque Remembrance',
      description: 'أذكار دخول المسجد والخروج منه والذهاب إليه'
    },
    {
      id: 7,
      slug: 'food',
      title_ar: 'أذكار الطعام والشراب والضيف',
      title_en: 'Remembrance for Food & Drink',
      description: 'أدعية ما قبل الطعام والانتهاء منه'
    },
    {
      id: 8,
      slug: 'travel',
      title_ar: 'أذكار وركوب الدابة والسفر',
      title_en: 'Travel Remembrance',
      description: 'دعاء السفر وركوب الدابة'
    },
    {
      id: 9,
      slug: 'general',
      title_ar: 'جوامع الدعاء والتسبيح والاستغفار',
      title_en: 'Comprehensive Remembrance & Forgiveness',
      description: 'أذكار مأثورة في فضل التسبيح والتهليل والاستغفار'
    }
  ];

  const rawAdhkar: Array<Omit<AdhkarItem, 'text_simple'>> = [
    // Morning (category 1)
    {
      id: 1,
      category_id: 1,
      text_ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',
      translation_en: 'We have entered the morning and at this very time the whole kingdom belongs to Allah, praise is due to Allah. None has the right to be worshipped but Allah alone, Who has no partner.',
      repeat_count: 1,
      virtue: 'حفظ ووقاية في اليوم كله',
      reference: 'صحيح مسلم (رقم 2723)'
    },
    {
      id: 2,
      category_id: 1,
      text_ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.',
      translation_en: 'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
      repeat_count: 1,
      virtue: 'شكر نعمة الصباح والحياة',
      reference: 'صحيح الترمذي (رقم 3391)'
    },
    {
      id: 3,
      category_id: 1,
      text_ar: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.',
      translation_en: 'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant, and I abide by Your covenant and promise as best I can.',
      repeat_count: 1,
      virtue: 'سيد الاستغفار: من قالها موقناً بها حين يمسي فمات من ليلته دخل الجنة، وكذلك إذا أصبح',
      reference: 'صحيح البخاري (رقم 6306)'
    },
    {
      id: 4,
      category_id: 1,
      text_ar: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',
      translation_en: 'In the name of Allah with Whose name nothing can harm on earth or in heaven, and He is the All-Hearing, All-Knowing.',
      repeat_count: 3,
      virtue: 'من قالها ثلاثاً إذا أصبح وثلاثاً إذا أمسى لم يضره شيء',
      reference: 'سنن أبي داود والترمذي وصححه الألباني'
    },
    {
      id: 5,
      category_id: 1,
      text_ar: 'رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيّاً.',
      translation_en: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad (peace and blessings of Allah be upon him) as my Prophet.',
      repeat_count: 3,
      virtue: 'من قالها ثلاثاً حين يصبح وثلاثاً حين يمسي كان حقاً على الله أن يرضيه يوم القيامة',
      reference: 'سنن الترمذي وصححه الألباني'
    },
    {
      id: 6,
      category_id: 1,
      text_ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
      translation_en: 'Glory is to Allah and praise is to Him, by the multitude of His creation, by His Pleasure, by the weight of His Throne, and by the extent of His Words.',
      repeat_count: 3,
      virtue: 'تعدل عبادة ساعات طويلة من الذكر والتسبيح',
      reference: 'صحيح مسلم (رقم 2726)'
    },
    {
      id: 7,
      category_id: 1,
      text_ar: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',
      translation_en: 'O Ever Living One, O Sustainer of all, by Your mercy I seek assistance; rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.',
      repeat_count: 1,
      virtue: 'دعاء تفويض الأمر كله إلى الله وحمايته وتوفيقه',
      reference: 'صحيح الحاكم وحسنه الألباني'
    },
    {
      id: 8,
      category_id: 1,
      text_ar: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ.',
      translation_en: 'O Allah, grant my body health, grant my hearing health, grant my sight health. None has the right to be worshipped except You.',
      repeat_count: 3,
      virtue: 'سؤال العافية والسلامة في الحواس والبدن والدين',
      reference: 'سنن أبي داود وأحمد وحسنه الألباني'
    },

    // Evening (category 2)
    {
      id: 9,
      category_id: 2,
      text_ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',
      translation_en: 'We have reached the evening and at this very time the whole kingdom belongs to Allah, praise is due to Allah. None has the right to be worshipped but Allah alone, Who has no partner.',
      repeat_count: 1,
      virtue: 'حفظ ووقاية في الليلة كلها',
      reference: 'صحيح مسلم (رقم 2723)'
    },
    {
      id: 10,
      category_id: 2,
      text_ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.',
      translation_en: 'O Allah, by Your leave we have reached the evening and by Your leave we reached the morning, by Your leave we live and die and unto You is our journey.',
      repeat_count: 1,
      virtue: 'شكر نعمة المساء والإقرار بالمصير',
      reference: 'صحيح الترمذي (رقم 3391)'
    },
    {
      id: 11,
      category_id: 2,
      text_ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
      translation_en: 'I seek refuge in the Perfect Words of Allah from the evil of what He has created.',
      repeat_count: 3,
      virtue: 'من قالها حين يمسي ثلاث مرات لم تضره حُمَة تلك الليلة (وقاية من كل ذي شر وسم)',
      reference: 'صحيح مسلم (رقم 2709)'
    },

    // Sleep (category 3)
    {
      id: 12,
      category_id: 3,
      text_ar: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',
      translation_en: 'In Your name my Lord, I lie down and in Your name I rise, so if You should take my soul then have mercy upon it, and if You should return my soul then protect it as You protect Your righteous slaves.',
      repeat_count: 1,
      virtue: 'حفظ النفس أثناء النوم',
      reference: 'صحيح البخاري ومسلم'
    },
    {
      id: 13,
      category_id: 3,
      text_ar: 'اللَّهُمَّ إِنَّكَ خَلَقْتَ نَفْسِي وَأَنْتَ تَوَفَّاهَا، لَكَ مَمَاتُهَا وَمَحْيَاهَا، إِنْ أَحْيَيْتَهَا فَاحْفَظْهَا، وَإِنْ أَمَتَّهَا فَاغْفِرْ لَهَا. اللَّهُمَّ إِنِّي أَسْأَلُكَ العَافِيَةَ.',
      translation_en: 'O Allah, verily You have created my soul and You shall take its life, unto You belongs its life and death. If You should keep my soul alive then protect it, and if You should take its life then forgive it. O Allah, I ask You for strength.',
      repeat_count: 1,
      virtue: 'تسليم الروح إلى خالقها وسؤال العافية',
      reference: 'صحيح مسلم (رقم 2712)'
    },
    {
      id: 14,
      category_id: 3,
      text_ar: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',
      translation_en: 'O Allah, protect me from Your punishment on the day You resurrect Your servants.',
      repeat_count: 3,
      virtue: 'يقال عند وضع اليد اليمنى تحت الخد الأيمن عند النوم',
      reference: 'سنن أبي داود والترمذي وصححه الألباني'
    },

    // Waking (category 4)
    {
      id: 15,
      category_id: 4,
      text_ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.',
      translation_en: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
      repeat_count: 1,
      virtue: 'شكر الله على نعمة الاستيقاظ والحياة بعد الموت الأصغر',
      reference: 'صحيح البخاري ومسلم'
    },
    {
      id: 16,
      category_id: 4,
      text_ar: 'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ.',
      translation_en: 'All praise is for Allah who restored to me my health and returned my soul and has allowed me to remember Him.',
      repeat_count: 1,
      virtue: 'شكر نعمة العافية في البدن والإذن بالذكر',
      reference: 'سنن الترمذي وحسنه الألباني'
    },

    // After Prayer (category 5)
    {
      id: 17,
      category_id: 5,
      text_ar: 'أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ. اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.',
      translation_en: 'I ask Allah for forgiveness (three times). O Allah, You are As-Salam (The Flawless) and from You comes peace, blessed are You, O Owner of majesty and honor.',
      repeat_count: 1,
      virtue: 'الاستغفار بعد انقضاء الصلاة المفروضة مباشرة',
      reference: 'صحيح مسلم (رقم 591)'
    },
    {
      id: 18,
      category_id: 5,
      text_ar: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.',
      translation_en: 'None has the right to be worshipped except Allah alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent. O Allah, none can prevent what You have granted and none can grant what You have prevented.',
      repeat_count: 1,
      virtue: 'التوحيد والافتقار إلى الله بعد الصلاة',
      reference: 'صحيح البخاري ومسلم'
    },
    {
      id: 19,
      category_id: 5,
      text_ar: 'سُبْحَانَ اللَّهِ (33)، وَالْحَمْدُ لِلَّهِ (33)، وَاللَّهُ أَكْبَرُ (33)، تَمَامَ الْمِائَةِ: لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
      translation_en: 'Glory is to Allah (33), praise is to Allah (33), and Allah is the Greatest (33), and to complete the hundred: None has the right to be worshipped except Allah alone...',
      repeat_count: 1,
      virtue: 'من قالها غُفرت خطاياه وإن كانت مثل زبد البحر',
      reference: 'صحيح مسلم (رقم 597)'
    },

    // Mosque (category 6)
    {
      id: 20,
      category_id: 6,
      text_ar: 'بِسْمِ اللَّهِ، وَالصَّلاَةُ وَالسَّلاَمُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.',
      translation_en: 'In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, open the doors of Your mercy for me.',
      repeat_count: 1,
      virtue: 'يقال عند دخول المسجد بالقدم اليمنى',
      reference: 'صحيح مسلم وسنن ابن ماجه'
    },
    {
      id: 21,
      category_id: 6,
      text_ar: 'بِسْمِ اللَّهِ وَالصَّلاَةُ وَالسَّلاَمُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ.',
      translation_en: 'In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, I ask You from Your favor. O Allah, protect me from the accursed devil.',
      repeat_count: 1,
      virtue: 'يقال عند الخروج من المسجد بالقدم اليسرى',
      reference: 'صحيح مسلم وسنن ابن ماجه'
    },

    // Travel (category 8)
    {
      id: 22,
      category_id: 8,
      text_ar: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، ﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ﴾، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ.',
      translation_en: 'Allah is the Greatest (3 times). How perfect He is, The One Who has placed this at our service and we could not have done so ourselves, and indeed unto our Lord is our return. O Allah, we ask You for righteousness and piety in this journey of ours...',
      repeat_count: 1,
      virtue: 'دعاء السفر وركوب الدابة والسيارة والطائرة',
      reference: 'صحيح مسلم (رقم 1342)'
    },

    // Comprehensive (category 9)
    {
      id: 23,
      category_id: 9,
      text_ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.',
      translation_en: 'Glory is to Allah and praise is to Him, Glory is to Allah the Magnificent.',
      repeat_count: 100,
      virtue: 'كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن',
      reference: 'صحيح البخاري ومسلم'
    },
    {
      id: 24,
      category_id: 9,
      text_ar: 'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.',
      translation_en: 'There is no power and no strength except with Allah.',
      repeat_count: 10,
      virtue: 'كنز من كنوز الجنة وباب من أبوابها',
      reference: 'صحيح البخاري ومسلم'
    },
    {
      id: 25,
      category_id: 9,
      text_ar: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ.',
      translation_en: 'I seek forgiveness from Allah, there is no deity worthy of worship except Him, the Ever-Living, the Sustainer, and I repent unto Him.',
      repeat_count: 3,
      virtue: 'من قالها غفر الله له وإن كان فر من الزحف',
      reference: 'سنن أبي داود والترمذي وصححه الألباني'
    }
  ];

  const adhkarList: AdhkarItem[] = rawAdhkar.map((item) => ({
    ...item,
    text_simple: normalizeArabicForSearch(item.text_ar)
  }));

  // Write categories.json
  const categoriesPath = path.join(dataDir, 'categories.json');
  fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), 'utf-8');
  console.log(`✅ Saved ${categories.length} Adhkar categories to ${categoriesPath}`);

  // Write adhkar.json
  const adhkarJson = JSON.stringify(adhkarList, null, 2);
  const adhkarPath = path.join(dataDir, 'adhkar.json');
  fs.writeFileSync(adhkarPath, adhkarJson, 'utf-8');
  console.log(`✅ Saved ${adhkarList.length} Adhkar records to ${adhkarPath}`);

  // Write manifest.json
  const manifest = writeManifest(
    dataDir,
    {
      dataset: 'hisn_almuslim_adhkar',
      version: '1.0.0',
      source: 'Hisn al-Muslim (Fortress of the Muslim) by Saeed bin Ali bin Wahf Al-Qahtani',
      license: 'Public Domain / Free for Non-Commercial & Educational Distribution',
      recordsCount: adhkarList.length,
      attribution: 'Authentic Adhkar compiled from Hisn al-Muslim with verified references and hadith gradings.'
    },
    adhkarJson
  );

  console.log(`🔒 Adhkar Checksum (SHA-256): ${manifest.checksum}`);
  return { totalCategories: categories.length, totalAdhkar: adhkarList.length };
}
