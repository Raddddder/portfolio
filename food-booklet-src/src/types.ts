export type Record = {
  id: string;
  storeName: string;
  budget: string;
  scene: string;
  noise: string;
  speed: string;
  details: string[];
  photoUrl: string;
  soulNote: string;
  author: string;
  campus: string;
  stamps: number;
  createdAt: number;
};

export interface UserProfile {
  name: string;
  recordsCount: number;
  stampsReceived: number;
}

export const getTitle = (recordsCount: number) => {
  if (recordsCount === 0) return '初级试毒员';
  if (recordsCount < 3) return '街头老饕';
  if (recordsCount < 10) return '仙林活地图';
  return '御膳房总管';
};
