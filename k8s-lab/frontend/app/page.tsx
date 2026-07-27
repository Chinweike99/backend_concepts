async function getBackend() {
  try {
    // const res = await fetch("http://localhost:8080/api/debug", {
    //   cache: "no-store",
    // });

    const backendUrl =
  process.env.BACKEND_URL ??
  "http://localhost:8080";

    const res = await fetch(
      `${backendUrl}/api/debug`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    return await res.json();
  } catch (error){
     return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default async function Home() {
  const backend = await getBackend();

  return (
    <main>
      <div className="card">
        <h1>Lab Frontend</h1>

        <p>Version: 1.0.0</p>

        <p>Environment: development</p>

        <hr />

        {backend ? (
          <>
            <h2>Backend</h2>

            <pre>{JSON.stringify(backend, null, 2)}</pre>
          </>
        ) : (
          <p>Backend Offline</p>
        )}
      </div>
    </main>
  );
}