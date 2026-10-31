// 곡 목록. 새 곡을 추가하려면 이 배열에 객체를 하나 더 넣으면 돼.
//   id        : 고유 키 (영문/숫자)
//   title     : 표시 제목 (대문자 권장)
//   artist    : 아티스트
//   audio     : 음원 경로 (songs/ 폴더). 파일이 없으면 데모 비트로 대체 재생됨
//   bpm       : 대략의 BPM — 정확한 박자 위치(offset)와 미세 BPM은 음원 분석으로 자동 보정
//   duration  : 음원이 없을 때 쓰는 예상 길이(초)
//   levels    : [EASY, NORMAL, HARD, OVERLOAD] 표시 레벨
//   preview   : 미리듣기 시작 지점(초)
//   isNew     : NEW 탭에 표시
//   cover     : { variant: 0|1|2, a: '#색', b: '#색' } (생략 가능)
export const SONGS = [
  {
    id: 'faded', title: 'FADED', artist: 'Alan Walker',
    audio: 'songs/faded.mp3', bpm: 90, duration: 207,
    levels: [4, 7, 10, 14], preview: 78,
    cover: { variant: 0, a: '#00f0ff', b: '#ff2a6d' },
  },
  {
    id: 'shape-of-you', title: 'SHAPE OF YOU', artist: 'Ed Sheeran',
    audio: 'songs/shape-of-you.mp3', bpm: 96, duration: 236,
    levels: [5, 8, 11, 16], preview: 150,
    cover: { variant: 1, a: '#ff2a6d', b: '#00f0ff' },
  },
  {
    id: 'sugar', title: 'SUGAR', artist: 'Maroon 5',
    audio: 'songs/sugar.mp3', bpm: 120, duration: 232,
    levels: [6, 10, 14, 18], preview: 116,
    cover: { variant: 2, a: '#a89dff', b: '#ff2a6d' },
  },
  {
    id: 'idgaf', title: 'IDGAF', artist: 'BoyWithUke ft. blackbear',
    audio: 'songs/idgaf.mp3', bpm: 98, duration: 139,
    levels: [5, 8, 11, 16], preview: 69, isNew: true,
    cover: { variant: 1, a: '#a89dff', b: '#00f0ff' },
  },
  {
    id: 'dangerously', title: 'DANGEROUSLY', artist: 'Charlie Puth',
    audio: 'songs/dangerously.mp3', bpm: 75, duration: 200,
    levels: [4, 6, 9, 13], preview: 108, isNew: true,
    cover: { variant: 2, a: '#00f0ff', b: '#a89dff' },
  },
  {
    id: 'i-aint-worried', title: "I AIN'T WORRIED", artist: 'OneRepublic',
    audio: 'songs/i-aint-worried.mp3', bpm: 140, duration: 148,
    levels: [6, 11, 16, 18], preview: 76, isNew: true,
    cover: { variant: 0, a: '#ff2a6d', b: '#a89dff' },
  },
];
