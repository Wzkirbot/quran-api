import { importQuranData } from './adapters/quran.adapter.js';
import { importAdhkarData } from './adapters/adhkar.adapter.js';
import { importDuaData } from './adapters/dua.adapter.js';
import { importTafsirData } from './adapters/tafsir.adapter.js';
import { importTranslationData } from './adapters/translation.adapter.js';

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all') || args.length === 0;

  console.log('====================================================');
  console.log('📥 Quran API - Data Acquisition & Ingestion Pipeline');
  console.log('====================================================');

  try {
    if (runAll || args.includes('--quran')) {
      await importQuranData();
    }

    if (runAll || args.includes('--adhkar')) {
      await importAdhkarData();
    }

    if (runAll || args.includes('--dua')) {
      await importDuaData();
    }

    if (runAll || args.includes('--tafsir')) {
      await importTafsirData();
    }

    if (runAll || args.includes('--translation')) {
      await importTranslationData();
    }

    console.log('====================================================');
    console.log('🎉 All selected datasets have been successfully');
    console.log('   acquired, validated, and saved to local storage!');
    console.log('   The API server can now run in 100% OFFLINE mode.');
    console.log('====================================================');
  } catch (error: any) {
    console.error('❌ Data Ingestion Failed:', error.message);
    process.exit(1);
  }
}

main();
