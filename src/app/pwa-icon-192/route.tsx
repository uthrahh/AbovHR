import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1a17",
          borderRadius: 40,
        }}
      >
        <svg width="118" height="118" viewBox="0 0 26 26" fill="none">
          <path
            d="M8 18V8.5L13 15l5-6.5V18"
            stroke="#e07a1f"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
