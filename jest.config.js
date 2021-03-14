module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/tests/__mocks__/styleMock.js",
    "\\.(gif|ttf|eot|svg)$": "<rootDir>/tests/__mocks__/fileMock.js",
  },
  testPathIgnorePatterns: ["<rootDir>/stories/"],
  coveragePathIgnorePatterns: ["node_modules", "<rootDir>/stories/"],
};
