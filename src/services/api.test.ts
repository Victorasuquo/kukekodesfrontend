import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "./api";


function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}


describe("Phase 2 API client contracts", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("loads course quizzes from the mounted course-scoped endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    await api.listCourseQuizzes("course-1");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/quizzes\/course\/course-1$/);
  });

  it("uses the enrollment check endpoint without converting API failures to false", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ course_id: "course-1", is_enrolled: false })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.checkEnrollment("course-1")).resolves.toEqual({
      course_id: "course-1",
      is_enrolled: false,
    });
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/enrollments\/check\/course-1$/);
  });

  it("posts lesson completion time to the canonical progress endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ lesson_id: "lesson-1", is_completed: true })
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.markLessonComplete("lesson-1", 12);

    expect(fetchMock.mock.calls[0][0]).toMatch(
      /\/api\/v1\/progress\/mark-lesson-complete\/lesson-1$/
    );
    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({ method: "POST", body: JSON.stringify({ time_spent_minutes: 12 }) })
    );
  });
});

describe("Phase 3 API client contracts", () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("keeps AI requests server-side and sends the lesson context", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ answer: "Use a loop." }));
    vi.stubGlobal("fetch", fetchMock);

    await api.askAI("How do I repeat this?", "lesson-1");

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/ai\/coach$/);
    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "How do I repeat this?", lesson_id: "lesson-1" }),
      })
    );
  });

  it("uses paginated community threads and preserves query filters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: [], meta: { page: 2, page_size: 10, total: 0, total_pages: 0 } })
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.listCommunityThreads({ course_id: "course-1", page: 2, page_size: 10 });

    expect(fetchMock.mock.calls[0][0]).toMatch(
      /\/api\/v1\/community\/threads\?course_id=course-1&page=2&page_size=10$/
    );
  });

  it("joins a live session through the API and does not fabricate a URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ join_url: "https://youtube.com/live/abc" }));
    vi.stubGlobal("fetch", fetchMock);

    await api.joinSession("session-1");

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/live-sessions\/session-1\/join$/);
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({ method: "POST" }));
  });

  it("submits code with an explicitly supported runtime", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ submission_id: "submission-1" }));
    vi.stubGlobal("fetch", fetchMock);

    await api.runCode("console.log(1)", "lesson-1", "javascript");

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/v1\/code\/submissions$/);
    expect(fetchMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ source: "console.log(1)", lesson_id: "lesson-1", runtime: "javascript" }),
      })
    );
  });
});
