import { apiUrl } from "../../lib/api";
import { getAccessToken } from "../../lib/auth";

export type BoardListItem = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  columns: Array<{
    id: string;
    boardId: string;
    key: "TODO" | "IN_PROGRESS" | "DONE";
    title: string;
    position: number;
  }>;
  _count: {
    tasks: number;
    tags: number;
  };
};

export async function fetchBoards() {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Hiányzik a hozzáférési token.");
  }

  const response = await fetch(apiUrl("/api/boards"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("A munkamenet lejárt vagy érvénytelen. Jelentkezz be újra.");
  }

  if (!response.ok) {
    const errorData = (await response.json()) as { message?: string };

    throw new Error(errorData.message || "Nem sikerült betölteni a boardokat.");
  }

  const successData = (await response.json()) as BoardListItem[];
  return successData;
}
