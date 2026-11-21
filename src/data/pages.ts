export const faqItems = [
  ["Do I need a PantriFul account?", "No. Food listings, filters, source links and directions are available without signing up."],
  ["Is every food resource in the county listed?", "Not yet. This directory combines a dated Feeding Tampa Bay public feed with additional published pantry listings. Mobile distributions, closures and newly opened sites can change; check the linked provider directory for the latest information."],
  ["Are hours and dietary options guaranteed?", "No. Listed hours describe a regular schedule, not confirmed live availability. Food supplies change. Ask the provider about halal, vegan, gluten-free and allergy-safe food before traveling."],
  ["What documents should I bring?", "Requirements vary by provider and program. Ask about photo ID, proof of address, household information, appointments and service-area restrictions using the listing's phone or source link."],
  ["Can I get directions without a car?", "Yes. Choose Transit, Walk or Bike above the listings. Directions opens Google Maps with your destination; Google determines available routes and schedules."],
  ["Are Empower rides free through PantriFul?", "For approved, fully funded food-assistance trips through the PantriFul–Empower ride program, riders experiencing food insecurity pay $0. PantriFul's donors cover the driver payment, and drivers keep their ride earnings under Empower's zero-commission rules. Ordinary Empower rides are not automatically covered. You request the trip here on PantriFul, so there is no separate Empower booking to make."],
  ["How do I use another language?", "Choose English or Español at the top. Organization names and addresses stay as published so you can identify the correct destination. Linked provider websites may use another language."],
];
export const aboutSections = [
  ["No account. No judgment.", "You should not need to register just to find your next meal. Everyone can browse local food resources and plan a visit."],
  ["Local focus", "From Tampa and Temple Terrace to Plant City, Brandon, Riverview, Ruskin and Wimauma, our focus is Hillsborough County."],
  ["Our sources", "Listings draw from Feeding Tampa Bay's public directory, FoodPantries.org and provider websites. Published addresses, schedules and eligibility can be outdated. PantriFul is not the food provider and does not guarantee service."],
];
export const valueSections = [
  ["Dignity", "Food is a basic need. People deserve clear information and respectful support, never judgment."],
  ["Accessibility", "No sign-up to browse, phone-friendly pages and language choices help more neighbors reach resources."],
  ["Honesty", "We distinguish published information from confirmed availability and make original sources easy to find."],
  ["Community", "We connect neighbors to existing local providers rather than replacing their work."],
  ["Zero Hunger", "Our work supports UN Sustainable Development Goal 2: Zero Hunger."],
];
export const rideSections = [
  ["Confirm Your Trip", "Use the booking form above to choose your food destination and visit time. PantriFul checks whether the trip is covered in Hillsborough County before a driver is assigned."],
  ["Your Ride Is Donor-Funded", "For an approved, fully funded food-assistance trip, your fare is $0: PantriFul's donors cover the driver payment through the PantriFul–Empower ride program. Drivers keep their ride earnings under Empower's zero-commission rules. Request the trip here on PantriFul — funding is confirmed before a driver is assigned."],
  ["Confirm pantry hours", "Call the food provider and check appointments before arranging transport. Plan how you will get home with your groceries."],
  ["Prefer public transport?", "Select Transit on the food finder and use a listing's Directions link. Route availability and fares are determined by Google Maps and the transport operator."],
];
export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} — PantriFul` }, { name: "description", content: description }, { property: "og:title", content: `${title} — PantriFul` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}
