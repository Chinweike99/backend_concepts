// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Next.js with Nginx Demo</h1>
      <p>
        This is a demonstration of using Nginx as a reverse proxy and load balancer with a Next.js application.
      </p>
      <p>
        <Link href="/api-test">
          <button>Test API and Load Balancing</button>
        </Link>
      </p>
    </main>
  );
}