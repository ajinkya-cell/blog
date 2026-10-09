async function main() {
  const res = await fetch("http://localhost:3000/blog/the-architecture-of-long-lived-software");
  const text = await res.text();
  console.log("HTML length:", text.length);
  // Find where "The page you are looking for does not exist" appears
  const idx = text.indexOf("The page you are looking for does not exist");
  console.log("Index of 404 text:", idx);
  if (idx !== -1) {
    console.log("Context around 404 text:\n", text.slice(Math.max(0, idx - 500), idx + 500));
  }
}

main().catch(console.error);
