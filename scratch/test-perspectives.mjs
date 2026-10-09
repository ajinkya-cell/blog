const projectId = "a2vuctp3";
const dataset = "production";
const token = "sk5FLqfyLXMqoXkPQjssQuTjWwJwvBMiqFqZIYv8lIkwsJzbIARNL8vlmmS4wByGwzFL8YbRpSemSO0o9CNj4PrPWM8DgKoYBh8HTqMN0mPxj5gMDcKgMgPFYpSvZNxwWQKwEM045VxkNjcThVwBA8yyeU1paDCK40BRt7nkrGSIrfnVbjZt";

// Test with perspective "drafts" and "published"
async function testPerspective(perspective) {
  const slug = "/blog/the-architecture-of-long-lived-software";
  const groq = `*[_type == "blog" && slug.current == $slug][0]`;
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(groq)}&$slug=${encodeURIComponent(JSON.stringify(slug))}&perspective=${perspective}`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.log(`Perspective '${perspective}':`, data.result ? data.result._id : "NOT FOUND (null)");
}

async function main() {
  await testPerspective("published");
  await testPerspective("drafts");
  await testPerspective("raw");
}

main().catch(console.error);
