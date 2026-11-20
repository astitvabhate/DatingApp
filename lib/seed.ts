import "server-only";
import type { Profile } from "./types";

// Seed "profiles table". Photos are randomuser.me placeholder portraits.
const w = (n: number) => `https://randomuser.me/api/portraits/women/${n}.jpg`;
const m = (n: number) => `https://randomuser.me/api/portraits/men/${n}.jpg`;

export const PROFILES: Profile[] = [
  { id: "p01", name: "Aisha", age: 24, photo: w(44), location: "Mumbai", bio: "Chai over coffee, always. Looking for someone to explore street food with.", interests: ["Food", "Travel", "Photography"], sideQuests: ["Street food crawls", "Golden-hour photos", "Weekend getaways", "Chai at Marine Drive", "Flea markets"] },
  { id: "p02", name: "Rohan", age: 27, photo: m(32), location: "Bengaluru", bio: "Backend engineer by day, amateur guitarist by night.", interests: ["Music", "Coding", "Hiking"], sideQuests: ["Open mic nights", "Guitar jams", "Night treks", "Hackathons"] },
  { id: "p03", name: "Meera", age: 22, photo: w(65), location: "IIT Delhi", bio: "Final-year design student. I will judge your font choices.", interests: ["Design", "Art", "Cafés"], sideQuests: ["Museum hopping", "Sketchbook sessions", "Café crawls", "Zine making", "Typography walks", "Pottery class"] },
  { id: "p04", name: "Kabir", age: 29, photo: m(75), location: "Pune", bio: "Weekend trekker. Ask me about the Sahyadris.", interests: ["Trekking", "Camping", "Dogs"], sideQuests: ["Sahyadri treks", "Camping under stars", "Dog park mornings", "Monsoon hikes", "Bonfires"] },
  { id: "p05", name: "Sara", age: 25, photo: w(12), location: "Hyderabad", bio: "Bookworm who also lifts. Balance is everything.", interests: ["Reading", "Fitness", "Podcasts"], sideQuests: ["Book club", "Heavy lifting", "Podcast walks", "Sunday brunch"] },
  { id: "p06", name: "Arjun", age: 26, photo: m(11), location: "Chennai", bio: "Cricket fanatic, filter-coffee loyalist.", interests: ["Cricket", "Coffee", "Movies"], sideQuests: ["Gully cricket", "Filter coffee runs", "Movie marathons", "Beach walks", "Stadium days"] },
  { id: "p07", name: "Priya", age: 23, photo: w(23), location: "BITS Pilani", bio: "Robotics club lead. I build things that move.", interests: ["Robotics", "Sci-Fi", "Board games"], sideQuests: ["Robot building", "Board game nights", "Sci-fi binges", "Stargazing"] },
  { id: "p08", name: "Vikram", age: 31, photo: m(52), location: "Delhi", bio: "Chef in training. I'll cook, you pick the playlist.", interests: ["Cooking", "Music", "Wine"], sideQuests: ["Cooking experiments", "Vinyl hunting", "Wine tasting", "Farmers' markets", "Supper clubs"] },
  { id: "p09", name: "Ananya", age: 26, photo: w(33), location: "Kolkata", bio: "Rabindra sangeet and rock music in the same playlist.", interests: ["Music", "Poetry", "Theatre"], sideQuests: ["Poetry readings", "Theatre nights", "Rooftop gigs", "Durga Puja pandal hopping", "Old bookshops", "Tram rides"] },
  { id: "p10", name: "Dev", age: 24, photo: m(22), location: "NIT Trichy", bio: "Competitive programmer, casual gamer, serious about biryani.", interests: ["Gaming", "Coding", "Food"], sideQuests: ["Gaming marathons", "Competitive coding", "Biryani hunts", "LAN parties"] },
  { id: "p11", name: "Isha", age: 28, photo: w(50), location: "Goa", bio: "Surf instructor. Sunsets are non-negotiable.", interests: ["Surfing", "Yoga", "Beaches"], sideQuests: ["Surfing", "Sunrise yoga", "Beach cleanups", "Shack sunsets", "Scuba diving"] },
  { id: "p12", name: "Nikhil", age: 30, photo: m(41), location: "Ahmedabad", bio: "Startup founder. Yes, I'll stop talking about it eventually.", interests: ["Startups", "Running", "Chess"], sideQuests: ["Startup meetups", "5K runs", "Chess in the park", "Kite festival"] },
  { id: "p13", name: "Tara", age: 21, photo: w(8), location: "St. Xavier's, Mumbai", bio: "Film studies major. Let's argue about Nolan.", interests: ["Film", "Writing", "Thrifting"], sideQuests: ["Indie film screenings", "Thrift hauls", "Writing sprints", "Bandra street art", "Film photography"] },
  { id: "p14", name: "Aditya", age: 27, photo: m(67), location: "Jaipur", bio: "Architect who loves old havelis and new ideas.", interests: ["Architecture", "Sketching", "History"], sideQuests: ["Haveli walks", "Urban sketching", "Heritage photography", "Rooftop dinners"] },
  { id: "p15", name: "Zoya", age: 25, photo: w(90), location: "Lucknow", bio: "Kebab connoisseur. Will plan the whole food crawl.", interests: ["Food", "Calligraphy", "Travel"], sideQuests: ["Kebab trails", "Calligraphy", "Old city walks", "Train journeys", "Chikankari shopping"] },
  { id: "p16", name: "Karan", age: 28, photo: m(85), location: "Chandigarh", bio: "Marathoner. Looking for a pace partner (and more).", interests: ["Running", "Fitness", "Travel"], sideQuests: ["Marathons", "HIIT classes", "Road trips", "Mountain biking", "Sunrise runs"] },
  { id: "p17", name: "Neha", age: 24, photo: w(17), location: "Manipal University", bio: "Med student. I'll remind you to drink water.", interests: ["Medicine", "Dance", "Baking"], sideQuests: ["Bollywood dance class", "Baking", "Hospital volunteering", "Beach evenings"] },
  { id: "p18", name: "Siddharth", age: 26, photo: m(3), location: "Kochi", bio: "Backwaters, bikes and bad puns.", interests: ["Biking", "Puns", "Photography"], sideQuests: ["Backwater rides", "Bike tours", "Fishing trips", "Comedy shows", "Tea estate stays"] },
  { id: "p19", name: "Riya", age: 23, photo: w(29), location: "Indore", bio: "Plant parent of 27. Accepting applications for 28.", interests: ["Plants", "Pottery", "Music"], sideQuests: ["Plant shopping", "Pottery wheel", "Music festivals", "Terrarium building", "Street food at Sarafa"] },
  { id: "p20", name: "Aman", age: 29, photo: m(46), location: "Gurugram", bio: "Product manager who actually reads the docs.", interests: ["Tech", "Badminton", "Podcasts"], sideQuests: ["Badminton", "Tech meetups", "Podcast hosting", "Weekend drives"] },
  { id: "p21", name: "Kavya", age: 27, photo: w(57), location: "Mysuru", bio: "Classical dancer and part-time stand-up comic.", interests: ["Dance", "Comedy", "Theatre"], sideQuests: ["Bharatanatyam", "Stand-up open mics", "Theatre", "Palace walks", "Dosa trails"] },
  { id: "p22", name: "Ishaan", age: 22, photo: m(14), location: "IIM Ahmedabad", bio: "MBA student. My spreadsheets have spreadsheets.", interests: ["Finance", "Football", "Travel"], sideQuests: ["Football Sundays", "Case competitions", "Backpacking", "Stock picking", "Garba nights", "Pol walks"] },
  { id: "p23", name: "Diya", age: 26, photo: w(72), location: "Shillong", bio: "Live music every weekend. Come find me at a gig.", interests: ["Live music", "Guitar", "Hiking"], sideQuests: ["Live gigs", "Guitar sessions", "Living root bridge treks", "Waterfall chasing", "Café sessions"] },
  { id: "p24", name: "Rahul", age: 32, photo: m(60), location: "Noida", bio: "Dad jokes, no dad. Looking for my favourite audience.", interests: ["Comedy", "Cooking", "Cycling"], sideQuests: ["Dad-joke nights", "Cooking for friends", "Cycling", "Board games"] },
  { id: "p25", name: "Pooja", age: 25, photo: w(38), location: "Bhopal", bio: "Wildlife photographer. Patience is my superpower.", interests: ["Wildlife", "Photography", "Travel"], sideQuests: ["Tiger safaris", "Birdwatching", "Wildlife photography", "Lake walks", "Road trips", "Camping"] },
  { id: "p26", name: "Yash", age: 24, photo: m(29), location: "VIT Vellore", bio: "Hackathon regular. Let's build something together.", interests: ["Hackathons", "AI", "Gaming"], sideQuests: ["Hackathons", "AI side projects", "Gaming", "Esports nights"] },
  { id: "p27", name: "Sneha", age: 28, photo: w(81), location: "Nagpur", bio: "Teacher who still gets excited about the first day of school.", interests: ["Teaching", "Reading", "Gardening"], sideQuests: ["Gardening", "Storytelling", "Book swaps", "Orange orchard visits", "Baking"] },
  { id: "p28", name: "Farhan", age: 27, photo: m(36), location: "Srinagar", bio: "Mountains are my therapy. Kahwa is my love language.", interests: ["Mountains", "Skiing", "Photography"], sideQuests: ["Skiing in Gulmarg", "Mountain photography", "Kahwa evenings", "Shikara rides", "Snow treks"] },
  { id: "p29", name: "Anika", age: 22, photo: w(5), location: "Ashoka University", bio: "Debater. I'll take either side, just for fun.", interests: ["Debate", "Politics", "Cafés"], sideQuests: ["Debate tournaments", "Café study dates", "Political podcasts", "Film clubs"] },
  { id: "p30", name: "Varun", age: 30, photo: m(18), location: "Visakhapatnam", bio: "Navy brat, sea lover, decent swimmer.", interests: ["Swimming", "Sailing", "Fishing"], sideQuests: ["Ocean swims", "Sailing", "Fishing", "Beach runs", "Lighthouse visits"] },
  { id: "p31", name: "Leela", age: 26, photo: w(47), location: "Pondicherry", bio: "French cafés, cycling by the promenade, slow mornings.", interests: ["Cycling", "Languages", "Baking"], sideQuests: ["Promenade cycling", "French lessons", "Baking croissants", "Slow mornings", "Auroville visits"] },
  { id: "p32", name: "Omar", age: 28, photo: m(7), location: "Hyderabad", bio: "Data scientist. I'll predict you'll swipe right.", interests: ["Data", "Cricket", "Food"], sideQuests: ["Data projects", "Cricket matches", "Biryani crawls", "Charminar nights", "Trivia nights"] },
];

// Server-only: profiles that have already liked the current user.
// This list must NEVER be sent to the client. It is only consulted when the
// user likes someone, to decide whether that like creates a mutual match.
// IDs are deliberately spread through the feed so ordering leaks nothing.
export const INBOUND_LIKES: ReadonlySet<string> = new Set([
  "p01", "p04", "p07", "p11", "p13", "p18", "p21", "p25", "p29", "p32",
]);
