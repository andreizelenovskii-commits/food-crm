declare module "@playwright/test" {
  export function defineConfig(config: unknown): unknown;
  export const test: {
    (name: string, fn: (args: { page: unknown }) => Promise<void> | void): void;
  };
  export const expect: (value: unknown) => {
    toHaveURL(pattern: RegExp): Promise<void>;
  };
}
