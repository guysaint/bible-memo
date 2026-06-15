/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 교회가 본문 파일을 올려둔 주소(있으면 "한 번 탭 설치" 노출) */
  readonly VITE_BIBLE_DATA_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
