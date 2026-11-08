# BOOTH Redirect

`booth.pm/<언어>/items/<아이템 id>`로 접속하면
`<제작자>.booth.pm/items/<아이템 id>`로 리다이렉트합니다.

## 설치
1. 압축을 풉니다.
2. Chrome 확장 프로그램 관리 창으로 이동합니다.
3. 오른쪽 상단 개발자 모드 켜기
4. "압축해제된 확장 프로그램을 로드" 버튼 → `booth-redirect` 폴더 선택

## 동작 방식
1. BOOTH 아이템 정보(`booth.pm/<언어>/items/<id>.json`)에서 제작자 주소 조회
2. 실패 시 페이지 안의 제작자 주소 조회

쿼리 문자열(`?...`)과 `#해시`는 그대로 유지됩니다.

## 제거
1. Chrome 확장 프로그램 관리 창으로 이동합니다.
2. `BOOTH Shop URL Redirect`를 찾아 삭제합니다.
