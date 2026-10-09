import fs from "fs";

const html = fs.readFileSync("scratch/rendered.html", "utf-8");
const idx = html.indexOf("The page you are looking for does not exist");
console.log("Found at index:", idx);
console.log(html.slice(idx - 300, idx + 200));
