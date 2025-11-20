import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  transform: {
    "^.+.tsx?$": ["ts-jest", {
      tsconfig: "tsconfig.jest.json"
    }],
    "^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testEnvironment: "jsdom",
};

export default config;
