import { formatTitle } from "./utils";

describe("title case", () => {
  test("uppercase every word", () => {
    expect(formatTitle("some_key")).toEqual("Some Key");
  });
  test("keep acronyms", () => {
    expect(formatTitle("tls_key")).toEqual("TLS Key");
  });
});
