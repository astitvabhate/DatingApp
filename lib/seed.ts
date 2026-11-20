import "server-only";
import type { Profile } from "./types";
import album from "./album.generated.json";

// Seed "profiles table". Photos are randomuser.me placeholder portraits.
const w = (n: number) => `https://randomuser.me/api/portraits/women/${n}.jpg`;

const SEED_PROFILES: Profile[] = [
  { id: "p03", name: "Meera", age: 22, gender: "woman", photo: w(65), location: "IIT Delhi", bio: "Final-year design student. I will judge your font choices.", interests: ["Design", "Art", "Cafés"], sideQuests: ["Museum hopping", "Sketchbook sessions", "Café crawls", "Zine making", "Typography walks", "Pottery class"] },
  { id: "p05", name: "Sara", age: 25, gender: "woman", photo: w(12), location: "Hyderabad", bio: "Bookworm who also lifts. Balance is everything.", interests: ["Reading", "Fitness", "Podcasts"], sideQuests: ["Book club", "Heavy lifting", "Podcast walks", "Sunday brunch"] },
  { id: "p01", name: "Aisha", age: 24, gender: "woman", photo: w(44), location: "Mumbai", bio: "Chai over coffee, always. Looking for someone to explore street food with.", interests: ["Food", "Travel", "Photography"], sideQuests: ["Street food crawls", "Golden-hour photos", "Weekend getaways", "Chai at Marine Drive", "Flea markets"] },
  { id: "p07", name: "Priya", age: 23, gender: "woman", photo: w(23), location: "BITS Pilani", bio: "Robotics club lead. I build things that move.", interests: ["Robotics", "Sci-Fi", "Board games"], sideQuests: ["Robot building", "Board game nights", "Sci-fi binges", "Stargazing"] },
  { id: "p09", name: "Ananya", age: 26, gender: "woman", photo: w(33), location: "Kolkata", bio: "Rabindra sangeet and rock music in the same playlist.", interests: ["Music", "Poetry", "Theatre"], sideQuests: ["Poetry readings", "Theatre nights", "Rooftop gigs", "Durga Puja pandal hopping", "Old bookshops", "Tram rides"] },
  { id: "p11", name: "Isha", age: 28, gender: "woman", photo: w(50), location: "Goa", bio: "Surf instructor. Sunsets are non-negotiable.", interests: ["Surfing", "Yoga", "Beaches"], sideQuests: ["Surfing", "Sunrise yoga", "Beach cleanups", "Shack sunsets", "Scuba diving"] },
  { id: "p13", name: "Tara", age: 21, gender: "woman", photo: w(8), location: "St. Xavier's, Mumbai", bio: "Film studies major. Let's argue about Nolan.", interests: ["Film", "Writing", "Thrifting"], sideQuests: ["Indie film screenings", "Thrift hauls", "Writing sprints", "Bandra street art", "Film photography"] },
  { id: "p15", name: "Zoya", age: 25, gender: "woman", photo: w(90), location: "Lucknow", bio: "Kebab connoisseur. Will plan the whole food crawl.", interests: ["Food", "Calligraphy", "Travel"], sideQuests: ["Kebab trails", "Calligraphy", "Old city walks", "Train journeys", "Chikankari shopping"] },
  { id: "p17", name: "Neha", age: 24, gender: "woman", photo: w(17), location: "Manipal University", bio: "Med student. I'll remind you to drink water.", interests: ["Medicine", "Dance", "Baking"], sideQuests: ["Bollywood dance class", "Baking", "Hospital volunteering", "Beach evenings"] },
  { id: "p19", name: "Riya", age: 23, gender: "woman", photo: w(29), location: "Indore", bio: "Plant parent of 27. Accepting applications for 28.", interests: ["Plants", "Pottery", "Music"], sideQuests: ["Plant shopping", "Pottery wheel", "Music festivals", "Terrarium building", "Street food at Sarafa"] },
  { id: "p21", name: "Kavya", age: 27, gender: "woman", photo: w(57), location: "Mysuru", bio: "Classical dancer and part-time stand-up comic.", interests: ["Dance", "Comedy", "Theatre"], sideQuests: ["Bharatanatyam", "Stand-up open mics", "Theatre", "Palace walks", "Dosa trails"] },
  { id: "p23", name: "Diya", age: 26, gender: "woman", photo: w(72), location: "Shillong", bio: "Live music every weekend. Come find me at a gig.", interests: ["Live music", "Guitar", "Hiking"], sideQuests: ["Live gigs", "Guitar sessions", "Living root bridge treks", "Waterfall chasing", "Café sessions"] },
  { id: "p25", name: "Pooja", age: 25, gender: "woman", photo: w(38), location: "Bhopal", bio: "Wildlife photographer. Patience is my superpower.", interests: ["Wildlife", "Photography", "Travel"], sideQuests: ["Tiger safaris", "Birdwatching", "Wildlife photography", "Lake walks", "Road trips", "Camping"] },
  { id: "p27", name: "Sneha", age: 28, gender: "woman", photo: w(81), location: "Nagpur", bio: "Teacher who still gets excited about the first day of school.", interests: ["Teaching", "Reading", "Gardening"], sideQuests: ["Gardening", "Storytelling", "Book swaps", "Orange orchard visits", "Baking"] },
  { id: "p29", name: "Anika", age: 22, gender: "woman", photo: w(5), location: "Ashoka University", bio: "Debater. I'll take either side, just for fun.", interests: ["Debate", "Politics", "Cafés"], sideQuests: ["Debate tournaments", "Café study dates", "Political podcasts", "Film clubs"] },
  { id: "p31", name: "Leela", age: 26, gender: "woman", photo: w(47), location: "Pondicherry", bio: "French cafés, cycling by the promenade, slow mornings.", interests: ["Cycling", "Languages", "Baking"], sideQuests: ["Promenade cycling", "French lessons", "Baking croissants", "Slow mornings", "Auroville visits"] },
];

// Photo album (public/images/album/women): a file named after a profile id
// (e.g. p01.jpg) goes to that profile; any other files fill the remaining
// profiles in filename order. Profiles without an album photo keep the placeholder.
function applyAlbum(profiles: Profile[]): Profile[] {
  const pool: string[] = [...(album.women as string[])];
  const byId = new Map<string, string>();
  for (let i = pool.length - 1; i >= 0; i--) {
    const id = pool[i].match(/\/(p\d+)\.[a-z]+$/i)?.[1];
    if (id) byId.set(id, pool.splice(i, 1)[0]);
  }
  return profiles.map((p) => {
    const photo = byId.get(p.id) ?? pool.shift();
    return photo ? { ...p, photo } : p;
  });
}

export const PROFILES: Profile[] = applyAlbum(SEED_PROFILES);

// Server-only: profiles that have already liked the current user.
// This list must NEVER be sent to the client. It is only consulted when the
// user likes someone, to decide whether that like creates a mutual match.
// IDs are deliberately spread through the feed so ordering leaks nothing.
export const INBOUND_LIKES: ReadonlySet<string> = new Set([
  "p01", "p07", "p11", "p13", "p21", "p25", "p29",
]);
