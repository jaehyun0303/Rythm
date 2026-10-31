# RYTHM — 사이버펑크 4키 리듬게임

`rhythm-ui-handoff` 목업(gameplay / song-select / results) 디자인 그대로 만든 웹 리듬게임. 빌드 도구 없이 정적 파일만으로 동작해요.

## 실행

모듈/fetch 때문에 `file://` 로는 안 열려요. 로컬 서버로 열어요.

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## 모바일 / PC

- **PC**: 키보드 `D F J K`. 마우스로 레인을 클릭해도 돼요.
- **모바일**: 가로로 들고 화면의 4개 레인을 직접 터치 (멀티터치 OK, 화면 어디든 레인 x 위치 기준). `SPACE` 대신 오버드라이브 패널을 탭하고, 곡 목록은 위아래 스와이프. 세로로 들면 회전 안내가 뜨고 플레이 중이면 자동 일시정지돼요.
- 터치 기기는 **LOW EFFECTS** 가 기본 ON (글로우/스캔라인 제거로 프레임 확보). 옵션에서 끌 수 있어요.
- 폰에서 열려면 서버가 폰이 닿는 주소여야 해요:
  - 같은 와이파이: PC에서 `python3 -m http.server 8000 --bind 0.0.0.0` → 폰 브라우저에서 `http://<PC의 IP>:8000`
  - 또는 GitHub Pages 등에 올리기 (이 경우 음원도 같이 올라가야 하니 저작권 주의)
- 홈 화면에 추가하면 주소창 없는 전체화면 앱처럼 실행돼요 (iOS Safari 는 전체화면 API 가 없어서 이 방법이 가장 깔끔해요).
- 블루투스 이어폰은 지연이 있으니 옵션의 **AUDIO OFFSET** 을 조정하세요.

## 음원 넣기

`songs/faded.mp3`, `songs/shape-of-you.mp3`, `songs/sugar.mp3` 를 넣어요 (자세한 건 `songs/README.md`). 없으면 데모 비트로 플레이돼요.

## 조작

| 키 | 동작 |
|---|---|
| `D F J K` | 4레인 |
| `SPACE` | 오버드라이브 발동 (게이지 100%) — 10초 동안 점수 ×1.5 |
| `ESC` | 일시정지 (`R` 재시도 / `Q` 나가기) |
| 곡 선택: `↑↓` 곡, `←→` 난이도, `ENTER` 시작, `F` 즐겨찾기, `TAB` 옵션 |
| 결과: `R` 재시도, `ENTER` 계속 |

옵션(TAB): 스크롤 속도, 오디오 오프셋(ms), 볼륨, 히트사운드, 오토플레이(기록 저장 안 됨). 계속 LATE 로 치면 오프셋을 + 로 올려요.

## 곡 추가하는 법

1. 음원을 `songs/` 에 넣기
2. `js/songs.js` 배열에 한 줄 추가 — `id / title / artist / audio / bpm / duration / levels / preview`

끝. 채보는 자동 생성돼요.

## 채보 자동 생성 (`js/chart.js`)

1. 음원을 모노로 합쳐 에너지 변화량(onset flux)을 계산
2. `bpm` 힌트 ±0.6 범위에서 BPM 과 박자 시작 위치를 격자 탐색으로 정밀 보정 (그래서 `songs.js` 의 bpm 은 대략만 맞으면 됨)
3. 16분음표 스텝마다 온셋 점수 + 박자 위치 가중치 → 마디별로 난이도에 맞는 개수만 선택 (조용한 구간은 자동으로 성기게)
4. 레인 배치(같은 레인 연타 회피, 방향 유지), 롱노트, 동시치기(HARD/OVERLOAD)

곡 id + 난이도로 시드를 고정하므로 같은 음원이면 항상 같은 채보가 나와요. 박자가 안 맞는 곡은 `songs.js` 의 `bpm` 을 정확히 고쳐 보세요 (가변 BPM 곡은 격자 보정이 어긋날 수 있어요).

## 구간별 배경 테마

곡을 마디별 에너지로 분석해 INTRO / VERSE / BUILD / CHORUS 구간을 자동으로 나누고, 구간이 바뀔 때 배경이 부드럽게 전환돼요 (예: 네온 도시 → 푸른 하늘). 36초보다 긴 구간은 쪼개서 인접 테마와 번갈아 써요. HUD 의 구간 이름과 진행바 눈금도 이 분석 결과를 써요.

테마: `cyber`(네온 도시) · `sky`(푸른 하늘) · `sunset`(석양) · `space`(우주) · `ember`(붉은 어둠)

`js/songs.js` 에서 곡마다 조정할 수 있어요.

```js
palette: ['space', 'sky', 'cyber'],       // [조용한 구간, 중간 구간, 강한 구간]
themes: [[0, 'cyber'], [75, 'sky']],      // (선택) 자동 대신 직접 지정: 75초부터 하늘
```

## 판정

PERFECT ±35ms · GREAT ±60ms · GOOD ±80ms (±80ms 밖은 MISS). 롱노트는 머리 판정 + 끝까지 유지, 일찍 떼면 MISS 로 전환. SYNC 가 0% 가 되면 실패.

## 파일 구조

```
manifest.webmanifest, icons/  홈 화면 추가(PWA)용
index.html        3개 화면 + 오버레이 마크업 (1280×720 스테이지)
css/style.css     목업 토큰/컴포넌트 스타일
js/main.js        라우팅, 옵션, 키 입력
js/game.js        하이웨이 렌더링, 판정, HUD, 오버드라이브, 고스트, 일시정지
js/select.js      곡 선택 (캐러셀, 필터, 난이도, 미리듣기)
js/results.js     결과 화면, 최고기록/레이팅/XP 저장
js/audio.js       Web Audio 엔진, 정밀 클럭, 데모 비트 합성
js/chart.js       채보 자동 생성 + 구간 검출 (DOM 의존 없음)
js/themes.js      구간별 배경 테마 5종
js/songs.js       곡 목록
js/cover.js       곡별 추상 커버 SVG
```

기록·설정은 브라우저 `localStorage`(`rythm.v1`)에 저장돼요.
