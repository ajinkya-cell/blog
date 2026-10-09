import fs from "fs";

async function main() {
  const res = await fetch("http://localhost:3000/blog/the-architecture-of-long-lived-software");
  const html = await res.text();
  fs.writeFileSync("scratch/rendered.html", html);
  console.log("Saved rendered.html, size:", html.length);
}

main().catch(console.error);
