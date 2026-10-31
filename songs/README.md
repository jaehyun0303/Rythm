# songs/ — 음원 폴더

여기에 음원 파일을 넣으면 게임이 자동으로 분석해서 채보를 만들어요.

| 곡 | 파일 이름 |
|---|---|
| FADED | `faded.mp3` |
| Shape of You | `shape-of-you.mp3` |
| Sugar | `sugar.mp3` |
| IDGAF | `idgaf.mp3` |
| Dangerously | `dangerously.mp3` |
| I Ain't Worried | `i-aint-worried.mp3` |
| I Really Want to Stay at Your House | `stay-at-your-house.mp3` |
| Spectre | `spectre.mp3` |
| Understand | `understand.mp3` |
| Out of Reach | `out-of-reach.mp3` |

- 파일 이름/경로는 `js/songs.js` 의 `audio` 값과 같아야 해요. mp3 / ogg / wav / m4a 모두 브라우저가 디코드할 수 있으면 돼요 (확장자만 맞춰서 `audio` 값을 수정).
- 파일이 없으면 곡 선택 화면에 `NO AUDIO FILE · DEMO BEAT` 가 뜨고, 합성 데모 비트로 대신 재생돼요 (게임은 그대로 플레이 가능).
- 음원은 저작권이 있는 파일이라 레포에는 포함하지 않았어요. `.gitignore` 로 커밋에서 제외돼 있어요 (공개 배포하려면 직접 권리를 확인하고 `.gitignore` 의 해당 줄을 지워요).
