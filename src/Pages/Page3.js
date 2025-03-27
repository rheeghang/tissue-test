// 각도가 15도인 경우의 스타일
const page3Styles = {
  titleMargin: '30px',      // 제목 여백 감소
  artistMargin: '25px',     // 작가명 여백 감소
  lineSpacing: '12px',      // 행간 감소
  textTop: '25px',          // 텍스트 상단 여백 감소
  containerPadding: '8vh',  // 컨테이너 패딩 감소
  titleBlockMargin: '40px'  // 제목 블록 여백 감소
}

return (
  <RotatedText 
    // ... other props ...
    rotationAngle={15}
    styles={page3Styles}
  />
) 