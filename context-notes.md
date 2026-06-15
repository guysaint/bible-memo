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
