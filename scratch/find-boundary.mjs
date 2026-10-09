import fs from "fs";

const html = fs.readFileSync("scratch/rendered.html", "utf-8");

// Let's find all $RC calls
const rcCalls = [...html.matchAll(/\$RC\("([^"]+)","([^"]+)"\)/g)];
console.log("RC calls:", rcCalls.map(m => ({ boundary: m[1], stream: m[2] })));

// Let's find where 404 is inside the stream divs
for (const m of rcCalls) {
  const streamId = m[2];
  const regex = new RegExp(`<div hidden id="${streamId}">([\\s\\S]*?)(?:<\\/div><script|$)`);
  const match = html.match(regex);
  if (match) {
    const content = match[1];
    if (content.includes("The page you are looking for does not exist")) {
      console.log(`404 IS IN STREAM ID: ${streamId}, which replaces boundary ${m[1]}!`);
      console.log("Content preview:\n", content.slice(0, 500));
    }
  }
}
