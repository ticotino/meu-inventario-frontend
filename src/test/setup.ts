import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Sem test.globals no vite.config.ts (cada arquivo importa describe/it/expect
// explicitamente), então o auto-cleanup do RTL — que depende de um afterEach
// global — precisa ser registrado manualmente aqui.
afterEach(() => {
  cleanup();
});
