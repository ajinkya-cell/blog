async function main() {
  const res = await fetch("http://localhost:3000/blog");
  const html = await res.text();
  const matches = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  console.log("All links on /blog:", matches);

  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();
  const homeMatches = [...homeHtml.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
  console.log("All links on /:", homeMatches);
}

main().catch(console.error);
