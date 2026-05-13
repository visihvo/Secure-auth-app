import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./tests/setupTests.js",

        //pool: "forks",

        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"]
        }
    }
});