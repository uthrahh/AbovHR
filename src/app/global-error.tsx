"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#faf8f5", color: "#1c1a17" }}>
        <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 16px", textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 600 }}>Abov hit an unexpected error</h1>
          <p style={{ marginTop: 8, color: "#4a453d" }}>
            Something went wrong loading the application. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              borderRadius: 6,
              background: "#a64400",
              color: "#fffaf5",
              border: "none",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
