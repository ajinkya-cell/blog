const projectId = "a2vuctp3";
const dataset = "production";
const token = "sk5FLqfyLXMqoXkPQjssQuTjWwJwvBMiqFqZIYv8lIkwsJzbIARNL8vlmmS4wByGwzFL8YbRpSemSO0o9CNj4PrPWM8DgKoYBh8HTqMN0mPxj5gMDcKgMgPFYpSvZNxwWQKwEM045VxkNjcThVwBA8yyeU1paDCK40BRt7nkrGSIrfnVbjZt";

async function query(groq) {
  let url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(groq)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await res.json();
  return data.result;
}

async function main() {
  const home = await query('*[_type == "homePage"][0]');
  console.log("homePage blocks:", home?.pageBuilder?.map(b => ({ type: b._type, ...b })));
}

main().catch(console.error);
