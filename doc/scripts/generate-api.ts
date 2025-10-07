async function generate() {
  try {
    // Load environment variables from .env file
    const fs = await import("fs");
    const path = await import("path");

    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      envContent.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      });
    }

    // remove old folder
    const outputPath = path.join(process.cwd(), "./content/docs/api");
    if (fs.existsSync(outputPath)) {
      fs.rmSync(outputPath, { recursive: true, force: true });
      console.log("Cleaned previous API docs");
    }

    const { generateFiles } = await import("fumadocs-openapi");

    const cmsUrl = process.env.CMS_URL || "http://localhost:3001";
    const apiKey = process.env.API_SPECS_API_KEY;

    if (!apiKey) {
      console.warn("No API_SPECS_API_KEY found in .env");
      return;
    }

    console.log("Fetching API specs from:", `${cmsUrl}/api/api-specs`);

    const response = await fetch(`${cmsUrl}/api/api-specs`, {
      headers: {
        Authorization: `api-specs API-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      console.warn("Failed to fetch API specs from CMS");
      return;
    }

    const data = await response.json();
    console.log("Total specs:", data.totalDocs);

    if (!data.docs || data.docs.length === 0) {
      console.warn("No API specs available");
      return;
    }

    const spec = data.docs[0];
    console.log("Fetching spec from:", spec.specUrl);

    await generateFiles({
      input: spec.specUrl,
      output: "./content/docs/api",
      per: "operation",
      groupBy: "tag",
      frontmatter: (title, description) => {
        // پاک کردن کاراکترهای خاص از description
        const cleanDescription = description
          ? description.replace(/[{}]/g, "").substring(0, 160)
          : "";
        
        return {
          title: title || "API Endpoint",
          description: cleanDescription,
          full: true,
        };
      },
      includeDescription: false, 
    });

    console.log("API docs generated successfully");
  } catch (error) {
    console.warn(
      "Failed to generate API docs:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

generate();