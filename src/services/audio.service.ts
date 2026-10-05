import fs from 'node:fs';
import path from 'node:path';
import { quranService } from './quran.service.js';

export interface Reciter {
  id: string;
  name_ar: string;
  name_en: string;
  style: string;
  riwayah: string;
  bitrate: string;
  subfolder: string;
  surah_url_template: string;
  ayah_url_template: string;
}

export interface AudioTrack {
  reciter: {
    id: string;
    name_ar: string;
    name_en: string;
    style: string;
  };
  type: 'surah' | 'ayah';
  surah_id: number;
  surah_name?: string;
  ayah_number?: number;
  reference?: string;
  audio_url: string;
  format: string;
}

class AudioService {
  private reciters: Reciter[] = [];

  constructor() {
    this.loadReciters();
  }

  private loadReciters(): void {
    try {
      const p = path.resolve(process.cwd(), 'data/audio/reciters.json');
      if (fs.existsSync(p)) {
        this.reciters = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch {
      this.reciters = [];
    }
  }

  public async getReciters(): Promise<Reciter[]> {
    return this.reciters;
  }

  public async getReciter(id: string): Promise<Reciter | null> {
    return this.reciters.find((r) => r.id === id.toLowerCase()) || null;
  }

  public async getSurahAudio(reciterId: string, surahId: number): Promise<AudioTrack | null> {
    const reciter = await this.getReciter(reciterId);
    if (!reciter || surahId < 1 || surahId > 114) return null;

    const surah = await quranService.getSurahById(surahId);
    const surah3 = String(surahId).padStart(3, '0');
    const audioUrl = reciter.surah_url_template.replace('{surah3}', surah3);

    return {
      reciter: {
        id: reciter.id,
        name_ar: reciter.name_ar,
        name_en: reciter.name_en,
        style: reciter.style
      },
      type: 'surah',
      surah_id: surahId,
      surah_name: surah?.name_ar,
      audio_url: audioUrl,
      format: 'audio/mpeg'
    };
  }

  public async getAyahAudio(reciterId: string, surahId: number, ayahNumber: number): Promise<AudioTrack | null> {
    const reciter = await this.getReciter(reciterId);
    if (!reciter) return null;

    const ayah = await quranService.getAyahByReference(`${surahId}:${ayahNumber}`);
    if (!ayah) return null;

    const surah3 = String(surahId).padStart(3, '0');
    const ayah3 = String(ayahNumber).padStart(3, '0');
    const audioUrl = reciter.ayah_url_template.replace('{surah3}', surah3).replace('{ayah3}', ayah3);

    return {
      reciter: {
        id: reciter.id,
        name_ar: reciter.name_ar,
        name_en: reciter.name_en,
        style: reciter.style
      },
      type: 'ayah',
      surah_id: surahId,
      ayah_number: ayahNumber,
      reference: `${surahId}:${ayahNumber}`,
      audio_url: audioUrl,
      format: 'audio/mpeg'
    };
  }
}

export const audioService = new AudioService();
