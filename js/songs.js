// 곡 목록. 새 곡을 추가하려면 이 배열에 객체를 하나 더 넣으면 돼.
//   id        : 고유 키 (영문/숫자)
//   title     : 표시 제목 (대문자 권장)
//   artist    : 아티스트
//   audio     : 음원 경로 (songs/ 폴더). 파일이 없으면 데모 비트로 대체 재생됨
//   bpm       : 대략의 BPM — 정확한 박자 위치(offset)와 미세 BPM은 음원 분석으로 자동 보정
//   duration  : 음원이 없을 때 쓰는 예상 길이(초)
//   levels    : [EASY, NORMAL, HARD, NIGHTMARE, OVERLOAD] 표시 레벨
//   preview   : 미리듣기 시작 지점(초)
//   isNew     : NEW 탭에 표시
//   cover     : { variant: 0|1|2, a: '#색', b: '#색' } (생략 가능)
//   extreme   : true 면 NIGHTMARE/OVERLOAD 가 박자 격자를 거의 전부 채우는 극악 채보가 됨 (스트림+동시치기+롱노트)
//   short     : 목록/HUD 에 쓸 짧은 제목 (긴 제목일 때)
//   palette   : [조용한 구간, 중간 구간, 강한 구간] 의 배경 장면 id. 공용 테마(cyber/sky/…) 또는 js/scenes.js 의 곡 전용 장면. 기본 ['sky','sunset','cyber']
//               테마: cyber(네온 도시) / sky(푸른 하늘) / sunset(석양) / space(우주) / ember(붉은 어둠)
//   sections  : (선택) 구간 직접 지정 [[시작초, '이름', 레벨0~2], ...] — 자동 분석이 평평한 곡용
//   themes    : (선택) 구간 자동 분석 대신 직접 지정 [[초, '테마'], ...]  예) [[0,'cyber'],[75,'sky']]
export const SONGS = [
  {
    id: 'faded', palette: ['fad-fog', 'fad-ocean', 'fad-dissolve'], title: 'FADED', artist: 'Alan Walker',
    audio: 'songs/faded.mp3', bpm: 90, duration: 207,
    levels: [4, 7, 10, 14, 16], preview: 78,
    cover: { variant: 0, a: '#00f0ff', b: '#ff2a6d' },
  },
  {
    id: 'shape-of-you', palette: ['soy-bar', 'soy-dance', 'soy-tropic'], title: 'SHAPE OF YOU', artist: 'Ed Sheeran',
    audio: 'songs/shape-of-you.mp3', bpm: 96, duration: 236,
    levels: [5, 8, 11, 16, 19], preview: 150,
    cover: { variant: 1, a: '#ff2a6d', b: '#00f0ff' },
  },
  {
    id: 'sugar', palette: ['sug-cloud', 'sug-candy', 'sug-rush'],
    sections: [[0, 'INTRO', 0], [20, 'VERSE', 1], [40, 'CHORUS', 2], [65, 'VERSE II', 1], [100, 'CHORUS II', 2], [130, 'BREAK', 0], [145, 'BUILD', 1], [160, 'FINAL CHORUS', 2], [215, 'OUTRO', 0]], title: 'SUGAR', artist: 'Maroon 5',
    audio: 'songs/sugar.mp3', bpm: 120, duration: 232,
    levels: [6, 10, 14, 20, 23], preview: 116,
    cover: { variant: 2, a: '#a89dff', b: '#ff2a6d' },
  },
  {
    id: 'idgaf', palette: ['idg-room', 'idg-wall', 'idg-riot'], title: 'IDGAF', artist: 'BoyWithUke ft. blackbear',
    audio: 'songs/idgaf.mp3', bpm: 98, duration: 139,
    levels: [5, 8, 11, 16, 19], preview: 69,
    cover: { variant: 1, a: '#a89dff', b: '#00f0ff' },
  },
  {
    id: 'dangerously', palette: ['dng-rain', 'dng-neon', 'dng-flame'], title: 'DANGEROUSLY', artist: 'Charlie Puth',
    audio: 'songs/dangerously.mp3', bpm: 75, duration: 200,
    levels: [4, 6, 9, 13, 15], preview: 108,
    cover: { variant: 2, a: '#00f0ff', b: '#a89dff' },
  },
  {
    id: 'i-aint-worried', palette: ['iaw-runway', 'iaw-sky', 'iaw-sunburst'],
    sections: [[0, 'INTRO', 0], [15, 'CHORUS', 2], [25, 'VERSE', 1], [50, 'BUILD', 1], [70, 'CHORUS II', 2], [95, 'BREAK', 0], [115, 'FINAL CHORUS', 2], [135, 'OUTRO', 0]], title: "I AIN'T WORRIED", artist: 'OneRepublic',
    audio: 'songs/i-aint-worried.mp3', bpm: 140, duration: 148,
    levels: [6, 11, 16, 22, 26], preview: 76,
    cover: { variant: 0, a: '#ff2a6d', b: '#a89dff' },
  },
  {
    id: 'stay-at-your-house', title: 'I REALLY WANT TO STAY AT YOUR HOUSE', short: 'STAY AT YOUR HOUSE',
    palette: ['stay-rain', 'stay-rooftop', 'stay-moon'],
    sections: [[0, 'INTRO', 0], [30, 'VERSE', 1], [100, 'BUILD', 1], [130, 'CHORUS', 2], [160, 'BREAK', 0], [170, 'CHORUS II', 2]],
    artist: 'Samuel Kim (Echo Ver.)',
    audio: 'songs/stay-at-your-house.mp3', bpm: 125, duration: 245,
    levels: [6, 10, 15, 21, 24], preview: 130,
    cover: { variant: 1, a: '#00f0ff', b: '#ff2a6d' },
  },
  {
    id: 'spectre', title: 'SPECTRE', artist: 'Alan Walker', palette: ['spc-mist', 'spc-wisps', 'spc-void'],
    audio: 'songs/spectre.mp3', bpm: 128, duration: 226,
    levels: [6, 9, 14, 20, 23], preview: 68,
    cover: { variant: 2, a: '#00f0ff', b: '#ff2a6d' },
  },
  {
    id: 'understand', title: 'UNDERSTAND', artist: 'BoyWithUke', palette: ['und-balcony', 'und-fireflies', 'und-lanterns'],
    audio: 'songs/understand.mp3', bpm: 103, duration: 195,
    levels: [5, 8, 11, 15, 18], preview: 126,
    cover: { variant: 0, a: '#a89dff', b: '#00f0ff' },
  },
  {
    id: 'out-of-reach', title: 'OUT OF REACH', artist: 'BoyWithUke', palette: ['oor-hill', 'oor-balloons', 'oor-skyward'],
    sections: [[0, 'INTRO', 0], [10, 'VERSE', 1], [30, 'CHORUS', 2], [40, 'VERSE II', 1], [65, 'CHORUS II', 2], [85, 'BREAK', 0], [100, 'CHORUS III', 2], [125, 'BRIDGE', 0], [135, 'FINAL CHORUS', 2], [155, 'OUTRO', 0]],
    audio: 'songs/out-of-reach.mp3', bpm: 148, duration: 165,
    levels: [6, 10, 15, 22, 25], preview: 71,
    cover: { variant: 1, a: '#ff2a6d', b: '#a89dff' },
  },
  {
    id: 'blueming', title: 'BLUEMING', artist: 'IU',
    palette: ['blueming-dawn', 'blueming-petals', 'blueming-bloom'],
    audio: 'songs/blueming.mp3', bpm: 106, duration: 222,
    levels: [5, 8, 12, 17, 20], preview: 124,
    cover: { variant: 1, a: '#ff8fb8', b: '#9fb4ff' },
  },
  {
    id: 'dreams', title: 'DREAMS', artist: 'Lost Sky',
    palette: ['dreams-night', 'dreams-nebula', 'dreams-ascend'],
    audio: 'songs/dreams.mp3', bpm: 145, duration: 215,
    levels: [6, 10, 14, 21, 24], preview: 70,
    cover: { variant: 2, a: '#4dffd0', b: '#c06bff' },
  },
  {
    id: 'running-in-the-sky', title: 'RUNNING IN THE SKY', artist: 'Duggy',
    palette: ['rits-dusk', 'rits-sunrise', 'rits-zenith'],
    sections: [[0, 'INTRO', 0], [10, 'VERSE', 1], [70, 'CHORUS', 2], [107, 'VERSE II', 1], [140, 'CHORUS II', 2], [195, 'FINALE', 2], [226, 'OUTRO', 0]],
    audio: 'songs/running-in-the-sky.mp3', bpm: 125, duration: 254,
    levels: [6, 10, 14, 21, 24], preview: 154,
    cover: { variant: 0, a: '#ffd27a', b: '#2d8cff' },
  },
  {
    id: 'rewrite-the-stars', title: 'REWRITE THE STARS', artist: 'Zac Efron & Zendaya',
    palette: ['rts-twilight', 'rts-constellations', 'rts-spectacle'],
    sections: [[0, 'INTRO', 0], [15, 'VERSE', 0], [72, 'BUILD', 1], [90, 'CHORUS', 2], [150, 'FINALE', 2], [196, 'OUTRO', 0]],
    audio: 'songs/rewrite-the-stars.mp3', bpm: 83.33, duration: 223,
    levels: [4, 6, 9, 12, 14], preview: 147,
    cover: { variant: 2, a: '#ffd27a', b: '#b9a6ff' },
  },
  {
    id: 'beautiful-things', title: 'BEAUTIFUL THINGS', artist: 'Benson Boone',
    palette: ['bt-window', 'bt-golden', 'bt-burst'],
    sections: [[0, 'INTRO', 0], [15, 'VERSE', 1], [60, 'BREAK', 0], [80, 'CHORUS', 2], [100, 'BRIDGE', 1], [115, 'CHORUS II', 2], [155, 'OUTRO', 0]],
    audio: 'songs/beautiful-things.mp3', bpm: 105, duration: 183,
    levels: [5, 8, 11, 15, 18], preview: 87,
    cover: { variant: 0, a: '#ffb070', b: '#ff6fa8' },
  },
  {
    id: 'cups', title: 'CUPS (WHEN I\'M GONE)', short: 'CUPS', artist: 'Anna Kendrick',
    palette: ['cups-table', 'cups-stage', 'cups-party'],
    audio: 'songs/cups.mp3', bpm: 130, duration: 127,
    levels: [5, 9, 13, 18, 21], preview: 34,
    cover: { variant: 2, a: '#f0b540', b: '#2a9d8f' },
  },
  {
    id: 'one-page', title: '한 페이지가 될 수 있게', artist: 'DAY6',
    palette: ['d6p-night', 'd6p-pages', 'd6p-together'],
    audio: 'songs/one-page.mp3', bpm: 87.5, duration: 206,
    levels: [5, 7, 11, 15, 17], preview: 58,
    cover: { variant: 1, a: '#8ab4ff', b: '#ffb7d0' },
  },
  {
    id: 'welcome-to-the-show', title: 'WELCOME TO THE SHOW', artist: 'DAY6',
    palette: ['wts-backstage', 'wts-lights', 'wts-showtime'],
    sections: [[0, 'INTRO', 0], [10, 'VERSE', 1], [50, 'CHORUS', 2], [85, 'BREAK', 0], [110, 'CHORUS II', 2], [160, 'BRIDGE', 1], [175, 'FINAL CHORUS', 2], [205, 'OUTRO', 0]],
    audio: 'songs/welcome-to-the-show.mp3', bpm: 132, duration: 236,
    levels: [6, 9, 14, 19, 23], preview: 71,
    cover: { variant: 0, a: '#ff4fa8', b: '#4fe0ff' },
  },
  {
    id: 'beethoven-virus', title: 'BEETHOVEN VIRUS', artist: 'BanYa · Diana Boncheva', extreme: true,
    palette: ['bv-hall', 'bv-keys', 'bv-virus'],
    sections: [[0, 'INTRO', 0], [10, 'DROP', 2], [80, 'BREAK', 1], [130, 'DROP II', 2], [170, 'BUILD', 1], [180, 'FINAL DROP', 2]],
    audio: 'songs/beethoven-virus.mp3', bpm: 156, duration: 220,
    levels: [9, 17, 28, 35, 42], preview: 44,
    cover: { variant: 2, a: '#ff3a5a', b: '#b98aff' },
  },
  {
    id: 'disappearance', title: '하츠네 미쿠의 소실', artist: 'cosMo@폭주P', extreme: true,
    palette: ['cos-stage', 'cos-ribbon', 'cos-vanish'],
    sections: [[0, 'INTRO', 0], [25, 'CHORUS', 2], [60, 'VERSE', 1], [75, 'CHORUS II', 2], [135, 'BREAK', 0], [145, 'CHORUS III', 2], [160, 'BRIDGE', 1], [175, 'FINAL CHORUS', 2], [275, 'OUTRO', 0]],
    audio: 'songs/disappearance.mp3', bpm: 240, duration: 286,
    levels: [12, 24, 42, 52, 62], preview: 111,
    cover: { variant: 1, a: '#39e6d0', b: '#ff7ac8' },
  },
  {
    id: 'immortals', title: 'IMMORTALS', artist: 'Fall Out Boy',
    palette: ['imm-dusk', 'imm-armor', 'imm-rise'],
    sections: [[0, 'INTRO', 0], [15, 'VERSE', 1], [30, 'BREAK', 0], [35, 'CHORUS', 2], [70, 'VERSE II', 0], [110, 'CHORUS II', 2], [135, 'BREAK', 0], [150, 'FINAL CHORUS', 2]],
    audio: 'songs/immortals.mp3', bpm: 108, duration: 190,
    levels: [5, 9, 12, 18, 21], preview: 56,
    cover: { variant: 0, a: '#ffd27a', b: '#4aa8ff' },
  },
  {
    id: 'fate', title: 'FATE (나는 아픈건 딱 질색이니까)', short: 'FATE', artist: '(G)I-DLE',
    palette: ['fat-thread', 'fat-tarot', 'fat-crimson'],
    audio: 'songs/fate.mp3', bpm: 115, duration: 162,
    levels: [6, 9, 14, 20, 22], preview: 91,
    cover: { variant: 2, a: '#ff3a5a', b: '#c9a8ff' },
  },
  {
    id: 'my-kingdom', title: 'MY KINGDOM', artist: '쿠키런: 킹덤 OST',
    palette: ['mk-meadow', 'mk-castle', 'mk-royal'],
    sections: [[0, 'INTRO', 0], [15, 'VERSE', 0], [45, 'BUILD', 1], [90, 'BREAK', 0], [105, 'BUILD II', 1], [130, 'CHORUS', 2], [220, 'FINALE', 2], [245, 'OUTRO', 0]],
    audio: 'songs/my-kingdom.mp3', bpm: 124, duration: 264,
    levels: [5, 9, 14, 19, 23], preview: 169,
    cover: { variant: 1, a: '#ffd04f', b: '#a88bff' },
  },
  {
    id: 'supersonic', title: 'SUPERSONIC', artist: 'fromis_9',
    palette: ['sup-dawn', 'sup-sonic', 'sup-burst'],
    sections: [[0, 'INTRO', 0], [25, 'PRE-CHORUS', 1], [35, 'CHORUS', 2], [65, 'VERSE', 1], [90, 'CHORUS II', 2], [115, 'BREAK', 0], [130, 'FINAL CHORUS', 2], [160, 'OUTRO', 0]],
    audio: 'songs/supersonic.mp3', bpm: 140, duration: 175,
    levels: [6, 10, 15, 22, 25], preview: 98,
    cover: { variant: 0, a: '#ff8ac8', b: '#8ae8ff' },
  },
  {
    id: 'monster', title: 'MONSTER', artist: 'LUM!X & Gabry Ponte',
    palette: ['mon-lair', 'mon-jaw', 'mon-rave'],
    sections: [[0, 'INTRO', 0], [15, 'VERSE', 0], [30, 'DROP', 2], [45, 'BUILD', 1], [55, 'DROP II', 2], [80, 'BREAK', 0], [95, 'BUILD II', 1], [100, 'DROP III', 2], [120, 'FINAL DROP', 2], [150, 'OUTRO', 0]],
    audio: 'songs/monster.mp3', bpm: 128, duration: 168,
    levels: [5, 9, 13, 18, 21], preview: 61,
    cover: { variant: 2, a: '#7aff4a', b: '#c06bff' },
  },
  {
    id: 'love-yourself', title: 'LOVE YOURSELF', artist: 'Justin Bieber',
    palette: ['lov-roof', 'lov-mirror', 'lov-heart'],
    sections: [[0, 'INTRO', 0], [20, 'VERSE', 1], [50, 'CHORUS', 2], [60, 'VERSE II', 0], [80, 'BUILD', 1], [120, 'CHORUS II', 2], [135, 'BRIDGE', 0], [165, 'FINAL CHORUS', 1], [215, 'OUTRO', 0]],
    audio: 'songs/love-yourself.mp3', bpm: 100, duration: 232,
    levels: [5, 8, 12, 17, 20], preview: 116,
    cover: { variant: 1, a: '#ff9a6a', b: '#b8c8ff' },
  },
  {
    id: 'nevada', title: 'NEVADA', artist: 'Vicetone feat. Cozi Zuehlsdorff',
    palette: ['nev-night', 'nev-road', 'nev-neon'],
    sections: [[0, 'INTRO', 0], [20, 'VERSE', 1], [50, 'CHORUS', 2], [75, 'BUILD', 1], [85, 'CHORUS II', 2], [110, 'BREAK', 0], [125, 'BUILD II', 1], [165, 'FINAL CHORUS', 2], [195, 'OUTRO', 0]],
    audio: 'songs/nevada.mp3', bpm: 124, duration: 209,
    levels: [5, 9, 14, 19, 23], preview: 54,
    cover: { variant: 1, a: '#ffb06a', b: '#b8a8ff' },
  },
  {
    id: 'memories', title: 'MEMORIES', artist: 'Maroon 5',
    palette: ['mem-album', 'mem-film', 'mem-toast'],
    sections: [[0, 'INTRO', 0], [15, 'VERSE', 1], [30, 'VERSE II', 0], [55, 'CHORUS', 2], [85, 'BREAK', 0], [100, 'BUILD', 1], [120, 'FINAL CHORUS', 2], [165, 'OUTRO', 0]],
    audio: 'songs/memories.mp3', bpm: 91, duration: 185,
    levels: [5, 8, 11, 16, 18], preview: 76,
    cover: { variant: 0, a: '#ffb06a', b: '#6ac8d8' },
  },
  {
    id: 'snowman', title: 'SNOWMAN', artist: 'Sia',
    palette: ['sno-night', 'sno-village', 'sno-aurora'],
    sections: [[0, 'INTRO', 0], [10, 'VERSE', 1], [35, 'CHORUS', 2], [60, 'VERSE II', 1], [75, 'BREAK', 0], [85, 'BUILD', 1], [120, 'FINAL CHORUS', 2], [150, 'OUTRO', 0]],
    audio: 'songs/snowman.mp3', bpm: 70, duration: 165,
    levels: [4, 6, 9, 12, 14], preview: 44,
    cover: { variant: 2, a: '#aac8ff', b: '#ff6ac8' },
  },
  {
    id: 'back-and-forth', title: 'BACK & FORTH (STRIPPED)', short: 'BACK & FORTH', artist: 'Tru Genesis',
    palette: ['bf-swing', 'bf-pendulum', 'bf-tide'],
    sections: [[0, 'INTRO', 0], [10, 'VERSE', 0], [30, 'CHORUS', 2], [45, 'VERSE II', 1], [55, 'CHORUS II', 2], [85, 'BRIDGE', 1], [95, 'BREAK', 0], [110, 'FINAL CHORUS', 2], [140, 'OUTRO', 0]],
    audio: 'songs/back-and-forth.mp3', bpm: 125, duration: 150,
    levels: [6, 9, 13, 19, 23], preview: 57,
    cover: { variant: 1, a: '#ffa04f', b: '#6ae8d8' },
  },
  {
    id: 'to-x', title: 'TO. X', artist: 'TAEYEON',
    palette: ['tox-letter', 'tox-mail', 'tox-x'],
    sections: [[0, 'INTRO', 0], [5, 'VERSE', 1], [25, 'CHORUS', 2], [45, 'VERSE II', 1], [85, 'CHORUS II', 2], [105, 'BRIDGE', 1], [125, 'FINAL CHORUS', 2], [155, 'OUTRO', 0]],
    audio: 'songs/to-x.mp3', bpm: 97, duration: 171,
    levels: [5, 8, 11, 16, 19], preview: 90, isNew: true,
    cover: { variant: 2, a: '#ff6a8a', b: '#b8a8ff' },
  },
];
