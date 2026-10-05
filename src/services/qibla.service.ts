/**
 * Qibla Direction & Distance Calculator Service
 * Uses precise Spherical Trigonometry (Great Circle forward azimuth)
 * Kaaba Coordinates: 21.422487° N, 39.826206° E
 */

export interface QiblaResult {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  kaaba: {
    latitude: number;
    longitude: number;
  };
  direction: number; // In degrees from True North [0, 360)
  compassDirection: {
    code: string;
    ar: string;
    en: string;
  };
  distance: {
    km: number;
    miles: number;
  };
}

export interface CityPreset {
  id: string;
  name_ar: string;
  name_en: string;
  country_ar: string;
  country_en: string;
  latitude: number;
  longitude: number;
}

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;
const EARTH_RADIUS_KM = 6371.0;

class QiblaService {
  private majorCities: CityPreset[] = [
    { id: 'jerusalem', name_ar: 'القدس الشريف', name_en: 'Jerusalem', country_ar: 'فلسطين', country_en: 'Palestine', latitude: 31.7683, longitude: 35.2137 },
    { id: 'amman', name_ar: 'عَمّان', name_en: 'Amman', country_ar: 'الأردن', country_en: 'Jordan', latitude: 31.9522, longitude: 35.9332 },
    { id: 'cairo', name_ar: 'القاهرة', name_en: 'Cairo', country_ar: 'مصر', country_en: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
    { id: 'riyadh', name_ar: 'الرياض', name_en: 'Riyadh', country_ar: 'السعودية', country_en: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },
    { id: 'medina', name_ar: 'المدينة المنورة', name_en: 'Medina', country_ar: 'السعودية', country_en: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692 },
    { id: 'dubai', name_ar: 'دبي', name_en: 'Dubai', country_ar: 'الإمارات', country_en: 'UAE', latitude: 25.2048, longitude: 55.2708 },
    { id: 'doha', name_ar: 'الدوحة', name_en: 'Doha', country_ar: 'قطر', country_en: 'Qatar', latitude: 25.2854, longitude: 51.5310 },
    { id: 'kuwait', name_ar: 'الكويت', name_en: 'Kuwait City', country_ar: 'الكويت', country_en: 'Kuwait', latitude: 29.3759, longitude: 47.9774 },
    { id: 'beirut', name_ar: 'بيروت', name_en: 'Beirut', country_ar: 'لبنان', country_en: 'Lebanon', latitude: 33.8938, longitude: 35.5018 },
    { id: 'damascus', name_ar: 'دمشق', name_en: 'Damascus', country_ar: 'سوريا', country_en: 'Syria', latitude: 33.5138, longitude: 36.2765 },
    { id: 'baghdad', name_ar: 'بغداد', name_en: 'Baghdad', country_ar: 'العراق', country_en: 'Iraq', latitude: 33.3152, longitude: 44.3661 },
    { id: 'istanbul', name_ar: 'إسطنبول', name_en: 'Istanbul', country_ar: 'تركيا', country_en: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
    { id: 'tunis', name_ar: 'تونس', name_en: 'Tunis', country_ar: 'تونس', country_en: 'Tunisia', latitude: 36.8065, longitude: 10.1815 },
    { id: 'algiers', name_ar: 'الجزائر', name_en: 'Algiers', country_ar: 'الجزائر', country_en: 'Algeria', latitude: 36.7538, longitude: 3.0588 },
    { id: 'rabat', name_ar: 'الرباط', name_en: 'Rabat', country_ar: 'المغرب', country_en: 'Morocco', latitude: 34.0209, longitude: -6.8416 },
    { id: 'khartoum', name_ar: 'الخرطوم', name_en: 'Khartoum', country_ar: 'السودان', country_en: 'Sudan', latitude: 15.5007, longitude: 32.5599 },
    { id: 'london', name_ar: 'لندن', name_en: 'London', country_ar: 'بريطانيا', country_en: 'UK', latitude: 51.5074, longitude: -0.1278 },
    { id: 'paris', name_ar: 'باريس', name_en: 'Paris', country_ar: 'فرنسا', country_en: 'France', latitude: 48.8566, longitude: 2.3522 },
    { id: 'new_york', name_ar: 'نيويورك', name_en: 'New York', country_ar: 'أمريكا', country_en: 'USA', latitude: 40.7128, longitude: -74.0060 },
    { id: 'jakarta', name_ar: 'جاكرتا', name_en: 'Jakarta', country_ar: 'إندونيسيا', country_en: 'Indonesia', latitude: -6.2088, longitude: 106.8456 }
  ];

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }

  /**
   * Calculates the Qibla direction (bearing) and distance from given coordinates
   */
  public calculateQibla(latitude: number, longitude: number): QiblaResult {
    const phi1 = this.toRadians(latitude);
    const lambda1 = this.toRadians(longitude);
    const phi2 = this.toRadians(KAABA_LAT);
    const lambda2 = this.toRadians(KAABA_LNG);

    const deltaLambda = lambda2 - lambda1;

    // Great circle forward azimuth formula
    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    let bearing = this.toDegrees(Math.atan2(y, x));
    bearing = (bearing + 360) % 360;

    // Haversine distance formula
    const deltaPhi = phi2 - phi1;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = EARTH_RADIUS_KM * c;
    const distanceMiles = distanceKm * 0.621371;

    return {
      coordinates: {
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6))
      },
      kaaba: {
        latitude: KAABA_LAT,
        longitude: KAABA_LNG
      },
      direction: parseFloat(bearing.toFixed(2)),
      compassDirection: this.getCompassLabel(bearing),
      distance: {
        km: parseFloat(distanceKm.toFixed(1)),
        miles: parseFloat(distanceMiles.toFixed(1))
      }
    };
  }

  private getCompassLabel(bearing: number): { code: string; ar: string; en: string } {
    const directions = [
      { code: 'N', ar: 'شمال', en: 'North' },
      { code: 'NNE', ar: 'شمال شمال شرق', en: 'North-Northeast' },
      { code: 'NE', ar: 'شمال شرق', en: 'Northeast' },
      { code: 'ENE', ar: 'شرق شمال شرق', en: 'East-Northeast' },
      { code: 'E', ar: 'شرق', en: 'East' },
      { code: 'ESE', ar: 'شرق جنوب شرق', en: 'East-Southeast' },
      { code: 'SE', ar: 'جنوب شرق', en: 'Southeast' },
      { code: 'SSE', ar: 'جنوب جنوب شرق', en: 'South-Southeast' },
      { code: 'S', ar: 'جنوب', en: 'South' },
      { code: 'SSW', ar: 'جنوب جنوب غرب', en: 'South-Southwest' },
      { code: 'SW', ar: 'جنوب غرب', en: 'Southwest' },
      { code: 'WSW', ar: 'غرب جنوب غرب', en: 'West-Southwest' },
      { code: 'W', ar: 'غرب', en: 'West' },
      { code: 'WNW', ar: 'غرب شمال غرب', en: 'West-Northwest' },
      { code: 'NW', ar: 'شمال غرب', en: 'Northwest' },
      { code: 'NNW', ar: 'شمال شمال غرب', en: 'North-Northwest' }
    ];

    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  }

  public getMajorCities(): CityPreset[] {
    return this.majorCities;
  }

  public getCityQibla(cityId: string): (CityPreset & { qibla: QiblaResult }) | null {
    const city = this.majorCities.find((c) => c.id.toLowerCase() === cityId.toLowerCase());
    if (!city) return null;
    const qibla = this.calculateQibla(city.latitude, city.longitude);
    return { ...city, qibla };
  }
}

export const qiblaService = new QiblaService();
