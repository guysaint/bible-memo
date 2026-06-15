# 컨텍스트 노트 (2026-06-15 홈 개선 작업)

작업하며 내린 결정과 이유를 계속 기록한다.

## 본문 자동 채우기 데이터 출처

- 개역개정은 대한성서공회 저작권이라 앱에 번들 불가. 사용자가 "비공식 온라인 데이터 사용"을 선택.
- 런타임 fetch 방식 채택 (앱에 본문을 포함하지 않음, 개인·교회용 전제).
- 검증한 엔드포인트: `https://api.getbible.net/v2/korean/{bookNr}/{chapter}.json`
  - HTTP 200, `access-control-allow-origin: *` → 브라우저 직접 fetch 가능.
  - jsDelivr 미러(`cdn.jsdelivr.net/gh/getbible/v2`)는 403이라 직접 API 사용.
  - 응답: `{ verses: [{ chapter, verse, name, text }] }`.
- **중요 한계**: getbible의 `korean`은 **개역한글(개역성경)**이지 개역개정이 아니다.
  예) 요 3:16 "저를 믿는 자마다 멸망치 않고"(개역한글) vs 개역개정 "그를 믿는 자마다 멸망하지 않고".
  무료로 쓸 수 있는 가장 근접 본문이므로 채택하되, 자동 입력 본문은 사용자가 직접 수정 가능하게 두고 UI에 "개역한글"이라고 명시한다.
- 책번호: `ALL_BOOKS` 인덱스+1 == getbible 1~66 (정경 순서 동일, 요한복음=43 확인).

## UI 결정

- AddVerse: 책·장·절(범위면 끝절 포함) 변경 시 250ms 디바운스 후 자동 fetch.
  사용자가 본문을 직접 고친 뒤에도, 책/장/절을 다시 바꾸면 새로 덮어쓴다(선택이 곧 본문).
  fetch 실패/없음이면 상태 문구만 보여주고 직접 입력 유지.
- Home: `selectedGroupIndex`, `selectedVerseId` 상태 추가.
  - 채워진 칸 클릭 → 그 구절을 "이번 주 말씀" 카드에 표시(최신 구절이 아니면 헤더를 "선택한 말씀"으로).
  - 현재(빈) 칸 클릭 → 추가 탭 이동.
  - 묶음 2개 이상이면 칩으로 묶음 전환(지난 묶음 복습).
- GroupProgress는 프레젠테이션 유지 + 클릭 핸들러 props만 추가(surgical).

## 2차 수정 (개역개정 합법 전환 + Stepper 재수정)

- Stepper '1' 안 지워짐 재수정: type=number는 select()가 안 먹어서(iOS/Chrome) 실패.
  → type=text + inputMode=numeric, 포커스 시 requestAnimationFrame으로 select()
  (클릭 후 mouseup이 선택을 풀기 때문에 한 틱 미룸). 편집 중 빈 칸 허용 위해 내부 draft 상태.
  preview에서 '1' 위에 '20' 입력 시 '20'으로 대체 확인.
- 개역한글 API(getbible)는 사용자가 "개역한글은 의미 없음"이라 해서 제거(services/bibleText.ts 삭제).
- 합법 전환 방식: 본문을 앱/저장소에 넣지 않고, 사용자가 정당하게 보유한 본문을
  기기(IndexedDB)에만 가져오는 방식 채택. 공개 사이트에는 저작물이 없으므로 배포가 깨끗함.
  - services/bibleData.ts: IndexedDB(`bible-memo-text`/`verses`), import/get/count/clear + 파일 파서
    (JSON 배열·{verses}, CSV/TSV 자동 구분자, 본문 속 구분자 보존 위해 앞 3필드만 분할).
  - components/verse/ImportDataModal.tsx: 파일 업로드, 빈 양식·샘플 내려받기, 현재 개수/비우기.
  - AddVerse: 자동 채우기 출처를 로컬 데이터로 교체. 데이터 없으면 자동채움 비활성 + 안내.
  - 본문 데이터는 사용자가 직접 확보(대한성서공회 허락/보유 소프트웨어/직접입력). 앱은 본문 미포함.

## 3차 — 데이터 보존 + 어르신 쉬운 설치 (교인 배포 대비)

배경: 데이터는 각 기기 localStorage(기록)·IndexedDB(본문)에만 저장 → 사라질 위험 있음
(특히 iOS Safari는 홈화면 미설치 시 7일 ITP 삭제). 교인(어르신) 배포 예정.

- 백업 내보내기/복원(선택됨): storage.ts exportBackupJson/importBackupJson,
  components/ui/BackupSection.tsx → History 화면(데이터 있을 때 + 빈 상태 양쪽)에 배치.
  백업은 기록(verses/sessions/exams)만. 본문은 재설치 가능하므로 제외.
- 한 번 탭 설치(선택됨): 본문을 공개 저장소에 커밋하지 않는다(저작권). 대신 교회가 올린
  URL에서 받아오기. bibleData.ts importFromUrl, ImportDataModal에 PRESET_URL(VITE_BIBLE_DATA_URL)
  "한 번에 설치" 버튼 + 수동 URL 입력. URL 미설정이면 파일/수동URL만 노출.
  → 목사님이 bible.json을 CORS 되는 주소(본인 GitHub raw 등)에 올리고 URL 주면 env 주입해 배포.
- vite-env.d.ts 추가(import.meta.env 타입 + VITE_BIBLE_DATA_URL).

## 4차 — 대한성서공회 허락 받음 → 앱 내장 전환

허락 조건: 출처 표기 "개역개정 ⓒ 대한성서공회"만. → 정식 내장.
- public/bible.json (5MB, 31088구절)을 앱에 포함. vite workbox globPatterns에 json 추가 +
  maximumFileSizeToCacheInBytes 8MB → 오프라인 캐시 포함.
- BUNDLED_BIBLE_URL = import.meta.env.BASE_URL + 'bible.json' (자기 출처).
- useAutoInstallBible: 첫 실행 시 countVerses()==0이면 자동 importFromUrl(BUNDLED) → 토스트.
  모듈 레벨 attempted 플래그로 1회만(StrictMode 대비), 실패 시 플래그 복구해 다음 실행 재시도.
- App.tsx 하단에 "개역개정 ⓒ 대한성서공회" 출처 표기(전 화면 공통).
- ImportDataModal: 외부 env URL 제거, PRESET_URL=BUNDLED. "개역개정 본문 다시 설치" 버튼.
- deploy.yml의 VITE_BIBLE_DATA_URL 제거, vite-env.d.ts는 reference만 남김.
- 외부 guysaint/bible-data repo는 더 이상 사용 안 함 → 비공개 전환 예정.
