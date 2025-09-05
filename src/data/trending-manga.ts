export interface TrendingManga {
  id: string;
  title: string;
  img: string;
  author: string;
}

export const trendingManga: TrendingManga[] = [
  {
    id: '91d928a1-7237-4d03-abc3-4b1440cc7d55',
    title: 'The Eminence In Shadow',
    img: '/img/shadow.png',
    author: 'Aizawa Daisuke',
  },
  {
    id: '3b8e4dc5-bffa-4382-a23c-be97c44ab4e2',
    title: 'Gate',
    img: '/img/gate.jpg',
    author: 'Yanai Takumi',
  },
  {
    id: 'b0b721ff-c388-4486-aa0f-c2b0bb321512',
    title: 'Sousou No Frieren',
    img: '/img/Sousou-No-Frieren.jpg',
    author: 'Kanehito Yamada, Tsukasa Abe',
  },
  {
    id: '9d62d9ad-a613-4979-b05a-6610692e9cc4',
    title: 'Whisper Me a Love Song',
    img: '/img/whisperlovesong.png',
    author: 'Eku Takeshima',
  },
];
