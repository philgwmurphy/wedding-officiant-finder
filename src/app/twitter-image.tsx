import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Ontario Wedding Officiant Finder";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #FAF8F5 0%, #F5EDE8 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(201, 169, 166, 0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(201, 169, 166, 0.2)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          {/* Heart/rings icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "#C9A9A6",
              marginBottom: 30,
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#4A3F3A",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Ontario Wedding
          </h1>
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#A67F7B",
              margin: 0,
              marginTop: 10,
              lineHeight: 1.1,
            }}
          >
            Officiant Finder
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 28,
              color: "#8A7D78",
              marginTop: 30,
              maxWidth: 800,
            }}
          >
            Find the perfect officiant for your ceremony from 22,000+ registered professionals
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 20, color: "#8A7D78" }}>
            onweddingofficiants.ca
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
