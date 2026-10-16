const url = "https://heraclitus-rien-bluerose.aws-ap-southeast-2.turso.io/v2/pipeline";
const token = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTEyOTgxMzUsImlkIjoiMDFhMTExYWYtNzAwMS03MDFkLWI4ZDktY2U0YzRkM2JiN2E3Iiwia2lkIjoiMV8yT0hVRmpqVkVZUHVXSmZuWXFoQVBKc21mODR6NUY2aG5FeVoxUkVVOCIsInJpZCI6IjE1MGRlODFjLTY3MjYtNDZkNS1iYTU3LWZiMjk3NGUwZDQ2NiJ9.eBbcZkzZV06bkTAsJsxABxiqbNE7uPt4M8yzogSc1xglN5FpFfsNTZlQUDcMHc24AK_Ilp5CLBhJ-70u_BZJBw";

async function query(sql) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requests: [{ type: "execute", stmt: { sql } }]
    })
  });
  const data = await res.json();
  return data.results[0].response.result;
}

async function main() {
  const count = await query("SELECT COUNT(*) FROM tempt_prompts;");
  console.log("COUNT:", count.rows[0][0].value);

  const sample = await query("SELECT id, tag, name, group_id, image_url, wiki_url, length, depend_on FROM tempt_prompts WHERE depend_on IS NOT NULL AND depend_on != '[]' LIMIT 10;");
  console.log("SAMPLE_WITH_DEPEND_ON:", JSON.stringify(sample.rows, null, 2));
}

main().catch(console.error);
