import { API_BASE } from "./config.js";

async function check(res, label) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${label} → ${res.status} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

export async function listTodos() {
  const res = await fetch(`${API_BASE}/todos`);
  return check(res, "GET /todos");
}

export async function createTodo(title) {
  const res = await fetch(`${API_BASE}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return check(res, "POST /todos");
}

export async function updateTitle(id, title) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  return check(res, "PATCH /todos");
}

export async function setCompleted(id, completed) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  return check(res, "PATCH /todos");
}

export async function deleteTodo(id) {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: "DELETE",
  });
  return check(res, "DELETE /todos");
}