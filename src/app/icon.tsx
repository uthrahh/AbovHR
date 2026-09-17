import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 26 26" fill="none">
          <path
            d="M8 18V8.5L13 15l5-6.5V18"
            stroke="#e07a1f"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
