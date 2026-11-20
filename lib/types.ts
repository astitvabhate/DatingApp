// Shared types. Safe to import from client components:
// nothing here describes who has liked the current user.

export type Profile = {
  id: string;
  name: string;
  age: number;
  gender: "woman" | "man";
  photo: string;
  bio: string;
  location: string; // city or college
  interests: string[];
  sideQuests: string[]; // 4–6 activities shown in the bento grid on profile pages
};

export type SwipeAction = "like" | "pass";

export type Match = {
  profile: Profile;
  matchedAt: string; // ISO timestamp
};

export type SwipeResponse = {
  matched: boolean;
  match?: Match;
};

export const CURRENT_USER = {
  id: "me",
  name: "You",
  photo: "https://randomuser.me/api/portraits/lego/1.jpg",
};
