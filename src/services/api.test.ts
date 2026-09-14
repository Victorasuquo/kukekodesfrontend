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
