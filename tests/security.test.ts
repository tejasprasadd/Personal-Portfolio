import { expect, test } from "bun:test";
import {
  redactSensitiveText,
  redactSensitiveValue,
  validateOAuthRedirect,
} from "../src/lib/security";

test("OAuth redirects accept registered callbacks and appended response parameters", () => {
  expect(
    validateOAuthRedirect(
      "https://client.example/callback?tenant=portfolio&code=abc&state=xyz",
      "https://client.example/callback?tenant=portfolio",
    ),
  ).toBe("https://client.example/callback?tenant=portfolio&code=abc&state=xyz");
});

test("OAuth redirects reject unregistered or deceptive targets", () => {
  const registered = "https://client.example/callback";
  for (const target of [
    "https://evil.example/callback",
    "https://client.example.evil.example/callback",
    "https://client.example:444/callback",
    "https://client.example/callback/extra",
    "https://user:password@client.example/callback",
    "javascript:alert(1)",
    "not a url",
  ]) {
    expect(validateOAuthRedirect(target, registered)).toBeNull();
  }
});

test("OAuth redirects preserve registered query constraints", () => {
  expect(
    validateOAuthRedirect(
      "https://client.example/callback?tenant=other&code=abc",
      "https://client.example/callback?tenant=portfolio",
    ),
  ).toBeNull();
});

test("sensitive log values are redacted", () => {
  const jwt = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxMjMifQ.signature";
  const text = redactSensitiveText(
    `Authorization: Bearer ${jwt} password=hunter2 https://user:pass@example.com/path`,
  );
  expect(text).not.toContain(jwt);
  expect(text).not.toContain("hunter2");
  expect(text).not.toContain("user:pass");

  expect(
    redactSensitiveValue({ access_token: jwt, nested: { apiKey: "private", safe: "hello" } }),
  ).toEqual({
    access_token: "[REDACTED]",
    nested: { apiKey: "[REDACTED]", safe: "hello" },
  });
});
