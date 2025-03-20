module.exports = {
  preset: 'jest-puppeteer',
  testMatch: [
    "**/e2e/**/*.test.{js,ts,tsx}"  // e2e 테스트 파일 위치 지정
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"    // TypeScript 지원
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  jest: {
    setTimeout: 30000
  }
};
