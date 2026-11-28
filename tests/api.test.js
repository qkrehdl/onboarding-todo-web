import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { API_BASE } from "../js/config.js";
import { createTodo, deleteTodo, listTodos, setCompleted, updateTitle } from "../js/api.js";

let calls = [];
let nextStatus = null;

globalThis.fetch = async (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  calls.push({ url: String(url), method, headers: new Headers(options.headers), body: options.body });
  const status = nextStatus ?? (method === "POST" ? 201 : method === "DELETE" ? 204 : 200);
  nextStatus = null;
  if (status === 204) return new Response(null, { status });
  const body = status >= 400 ? { detail: "실패" } : method === "GET" ? [] : { id: 3, title: "공부하기", completed: false, created_at: "2026-11-30T19:00:00" };
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
};

beforeEach(() => {
  calls = [];
});

const last = () => calls.at(-1);
const sentJson = () => JSON.parse(last().body);
const isJson = () => (last().headers.get("content-type") || "").includes("application/json");

test("목록 — GET /todos", async () => {
  assert.deepEqual(await listTodos(), []);
  assert.equal(last().method, "GET");
  assert.equal(last().url, `${API_BASE}/todos`);
});

test("등록 — POST /todos, 본문 {title}", async () => {
  await createTodo("공부하기");
  assert.equal(last().method, "POST");
  assert.equal(last().url, `${API_BASE}/todos`);
  assert.ok(isJson(), "Content-Type: application/json 헤더가 없다");
  assert.deepEqual(sentJson(), { title: "공부하기" });
});

test("제목 수정 — PATCH /todos/{id}, 본문 {title}", async () => {
  await updateTitle(3, "복습하기");
  assert.equal(last().method, "PATCH");
  assert.equal(last().url, `${API_BASE}/todos/3`);
  assert.ok(isJson(), "Content-Type: application/json 헤더가 없다");
  assert.deepEqual(sentJson(), { title: "복습하기" });
});

test("완료 변경 — PATCH /todos/{id}, 본문 {completed}", async () => {
  await setCompleted(3, true);
  assert.equal(last().method, "PATCH");
  assert.equal(last().url, `${API_BASE}/todos/3`);
  assert.ok(isJson(), "Content-Type: application/json 헤더가 없다");
  assert.deepEqual(sentJson(), { completed: true });
});

test("삭제 — DELETE /todos/{id}, 본문 없음", async () => {
  assert.equal(await deleteTodo(3), null);
  assert.equal(last().method, "DELETE");
  assert.equal(last().url, `${API_BASE}/todos/3`);
  assert.equal(last().body, undefined);
});

test("실패 응답(400)은 오류로 던져 화면에 보이게 한다", async () => {
  nextStatus = 400;
  await assert.rejects(createTodo("   "), /400/);
});