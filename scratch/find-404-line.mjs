import fs from "fs";

const html = fs.readFileSync("scratch/rendered.html", "utf-8");

// Search for notFound or 404
const lines = html.split("\n");
console.log("Total lines:", lines.length);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("The page you are looking for does not exist")) {
    console.log(`Line ${i}: length ${lines[i].length}`);
    console.log(lines[i].slice(0, 1000));
  }
}
