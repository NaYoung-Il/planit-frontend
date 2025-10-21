커뮤니티 CRUD 연동 완료했습니다.
- 후기 목록: /reviews에서 불러온 뒤 좋아요/댓글/사진 정보 합쳐 카드 노출
- 작성/삭제/좋아요/댓글: axios로 각각 API 연결, 비로그인 차단 처리
- 스타일은 기존 Card/Button 컴포넌트 그대로 사용, CSS 수정 없음

/reviews 목록·등록·삭제 + /likes·/comments·/photos 연계 호출 정상입니다.
VITE_API_URL, VITE_COMMUNITY_TRIP_ID만 맞추면 바로 동작합니다.
현재는 cities/trips 데이터가 비어 있어 등록 테스트가 막히니, 참조 데이터 채우면 정상 확인 가능합니다.
