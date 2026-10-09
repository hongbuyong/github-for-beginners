# 인스타그램 게시글·릴스 만들기

케이스 파일(`cases/*.json`) 하나에 **내용만** 적으면, 같은 디자인으로 아래 결과물이 자동으로 만들어져요.

| 결과물 | 크기 | 위치 |
|---|---|---|
| 게시글(캐러셀) 이미지 | 1080×1350 (4:5) | `out/<케이스>/post/01.png …` |
| 릴스 장면 이미지 | 1080×1920 (9:16) | `out/<케이스>/reel/01.png …` |
| 릴스 영상 | 1080×1920, 장마다 부드럽게 넘어감, 소리 없음 | `out/<케이스>/reel.mp4` |
| 캡션과 해시태그 | 복사해서 붙여 넣기 | `out/<케이스>/caption.txt` |

> 릴스 영상에는 소리를 넣지 않았어요. 인스타그램 앱에서 올릴 때 음악을 고르면 돼요.

## 가장 쉬운 방법: 설치 없이 GitHub에서 받기

1. `cases/` 폴더에 케이스 파일을 추가하거나 고쳐서 PR을 올려요. (GitHub 웹에서 **Add file → Create new file**로도 돼요.)
2. PR 아래 **인스타 이미지 만들기** 검사가 자동으로 돌아요. 내용에 문제가 있으면 무엇을 고칠지 한국어로 알려 줘요.
3. 검사가 끝나면 **Actions** 탭 → 해당 실행 → 아래 **Artifacts**의 `instagram`을 내려받아요. 압축을 풀면 이미지, 영상, 캡션이 들어 있어요.

`main`에 합쳐질 때도 같은 결과물이 만들어지고, Actions 탭에서 **Run workflow**를 눌러 언제든 다시 만들 수도 있어요.

## 내 컴퓨터에서 만들기

[Node.js](https://nodejs.org) 22 이상과 [ffmpeg](https://ffmpeg.org)(릴스 영상용)가 필요해요.

```bash
cd social
npm install
npx playwright install chromium   # 처음 한 번만

npm run preview   # 브라우저에서 http://localhost:4173 을 열어 바로 확인
npm run check     # 케이스 파일 검사만
npm run render    # 모든 케이스 만들기
npm run render -- 03-my-case            # 한 케이스만
npm run render -- --format post         # 게시글만 (릴스만: --format reel)
npm run render -- --no-video            # 영상 빼고 이미지만
```

미리보기 화면을 띄워 둔 채 케이스 파일을 고치고 새로고침하면 바로 반영돼요.

## 새 케이스 만들기

1. `cases/`의 파일 하나를 복사해서 새 이름으로 저장해요. 이름 앞에 번호를 붙이면 순서대로 정리돼요. (예: `03-what-is-branch.json`)
2. 아래 칸들을 채워요.

```json
{
  "series": "헷갈리는 깃 용어",
  "accent": "main",
  "caption": "인스타 본문에 들어갈 글",
  "hashtags": ["깃허브", "개발입문"],
  "slides": [
    { "type": "cover", "kicker": "헷갈리는 깃 용어 #3", "title": "브랜치는\n**왜** 만들까?", "cast": { "who": "duo" } },
    { "type": "concept", "label": "브랜치", "title": "원본은 그대로,\n**복사본**에서 작업", "body": "설명 글" },
    { "type": "end", "title": "정리 한 줄", "cta": "전체 흐름 보러 가기" }
  ]
}
```

- `accent`는 강조 색이에요. 케이스 전체에 정하고, 장마다 바꿀 수도 있어요.
  `main`(파랑) · `cloud`(보라) · `feature`(주황) · `hot`(분홍) · `mate`(노랑)
- 글 안에서 `**강조**`는 형광펜, `` `git push` ``는 코드 모양, `\n`은 줄바꿈이에요.
- 글자 수가 너무 많거나 칸 이름에 오타가 있으면 검사에서 어디가 문제인지 알려 줘요.
- 그림이 화면 밖으로 넘치면 이미지를 만들 때 몇 번째 장인지 알려 줘요. 문장을 줄여 주세요.
- 컴퓨터마다 글자 폭이 조금씩 달라서, 넘치기 직전으로 꽉 찬 장도 미리 알려 줘요. 내 컴퓨터에서는 괜찮아도 GitHub에서는 넘칠 수 있기 때문이에요.

## 슬라이드 종류(`type`)

| type | 쓰임 | 칸 |
|---|---|---|
| `cover` | 첫 장. 피드에서 눈길을 끄는 큰 질문 | `kicker`, **`title`**, `subtitle` |
| `talk` | 나와 팀원의 대화. 이야기로 끌어들이기 | `title`, **`lines`**: `who`(me/tm), `mood`, **`text`** (2~4개) |
| `concept` | 개념 하나 설명 | `label`, **`title`**, `body` |
| `compare` | 두 가지 비교 | `title`, **`left`**/**`right`**: `label`, `points`(1~4개), `verdict` |
| `steps` | 순서가 있는 과정 | `title`, **`items`**: **`name`**, `desc` (2~5개) |
| `terminal` | 실제 명령어 화면 | `title`, **`lines`**: `cmd`(입력한 명령), `out`(출력), `code`(파일 내용) 중 하나, `note` |
| `myth` | 흔한 오해와 사실 | **`myth`**, **`truth`** |
| `analogy` | 일상 장면에 빗대기. 어려운 설명 앞에 두면 좋아요 | **`scene`**(`restaurant` 식당 · `library` 도서관 · `photo` 사진), **`label`**, `title`, **`pairs`**: **`life`**(일상), **`git`**(깃 용어) (2~4개), `note` |
| `end` | 마지막 장. 정리와 안내(사이트 주소는 자동) | **`title`**, `body`, `cta` |

굵게 표시한 칸은 꼭 있어야 해요. 모든 장에는 `accent`, `seconds`(릴스에서 이 장을 보여 줄 초), `cast`(캐릭터)를 더 쓸 수 있어요.

## 캐릭터(`cast`)

사이트 애니메이션의 "나"와 "팀원"이에요. 머리 모양과 옷 색이 사이트와 같아요.

```json
"cast": { "who": "me", "mood": "proud", "pose": "laptop", "say": "세이브 완료!" }
```

| 칸 | 값 |
|---|---|
| `who` | `me`(나) · `tm`(팀원) · `duo`(둘이 GitHub를 사이에 두고 함께, 표지용) |
| `mood` | `idle`(기본) · `happy`(웃음) · `proud`(뿌듯) · `confused`(갸웃) · `surprised`(놀람) |
| `pose` | `idle`(기본) · `wave`(손 흔들기) · `point`(가리키기) · `laptop`(노트북 들기) |
| `say` | 말풍선 한마디(24자 이하) |

## 고치고 늘리는 법

| 바꾸고 싶은 것 | 고칠 곳 |
|---|---|
| 계정 이름, 사이트 주소, 이미지 크기, 릴스 장당 시간 | `config.json` |
| 색, 글자 크기, 여백 | `template/slides.css` 맨 위의 `:root` |
| 캐릭터 모습, 표정, 포즈 | `template/characters.js` |
| 새 슬라이드 종류 | `template/layouts.js`에 항목 하나 + `template/slides.css`에 스타일 |

새 슬라이드 종류를 추가하면 검사 규칙(`fields`)과 그리는 방법(`render`)이 한곳에 있어서, 검사기도 자동으로 새 종류를 알아봐요.

릴스는 위(계정 이름), 아래(설명·음악), 오른쪽(좋아요 버튼)이 앱 화면에 가려져요. 그래서 릴스 장면은 그 부분을 비워 두고 가운데에 내용을 모아요.

## 사용한 글꼴

- [Pretendard](https://github.com/orioncactus/pretendard), [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (둘 다 SIL Open Font License 1.1)

npm으로 내려받아 쓰고, 어느 컴퓨터에서 만들어도 똑같이 보이도록 시스템 글꼴에 기대지 않아요.
