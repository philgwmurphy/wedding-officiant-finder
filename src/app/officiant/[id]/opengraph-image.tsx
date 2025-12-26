import { ImageResponse } from "next/og";
import { getOfficiantById } from "@/lib/supabase";

export const runtime = "edge";

export const alt = "Wedding Officiant Profile";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #FAF8F5 0%, #F5EDE8 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span style={{ fontSize: 48, color: "#8A7D78" }}>Officiant Not Found</span>
        </div>
      ),
      { ...size }
    );
  }

  const officiant = await getOfficiantById(id);

  if (!officiant) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "linear-gradient(135deg, #FAF8F5 0%, #F5EDE8 100%)",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span style={{ fontSize: 48, color: "#8A7D78" }}>Officiant Not Found</span>
        </div>
      ),
      { ...size }
    );
  }

  const initials = `${officiant.firstName.charAt(0)}${officiant.lastName.charAt(0)}`.toUpperCase();

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
          padding: "60px",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(201, 169, 166, 0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 60,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(201, 169, 166, 0.2)",
          }}
        />

        {/* Avatar with initials */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "#F5EDE8",
            border: "4px solid #C9A9A6",
            marginBottom: 30,
          }}
        >
          <span
            style={{
              fontSize: 60,
              fontWeight: 700,
              color: "#A67F7B",
            }}
          >
            {initials}
          </span>
        </div>

        {/* Name */}
        <h1
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: "#4A3F3A",
            margin: 0,
            textAlign: "center",
          }}
        >
          {officiant.firstName} {officiant.lastName}
        </h1>

        {/* Title */}
        <p
          style={{
            fontSize: 32,
            color: "#A67F7B",
            margin: "15px 0 0 0",
            fontWeight: 500,
          }}
        >
          Wedding Officiant
        </p>

        {/* Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 25,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A7D78"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ fontSize: 26, color: "#8A7D78" }}>
            {officiant.municipality}, Ontario
          </span>
        </div>

        {/* Affiliation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
            padding: "10px 24px",
            background: "rgba(201, 169, 166, 0.2)",
            borderRadius: 30,
          }}
        >
          <span style={{ fontSize: 22, color: "#4A3F3A" }}>
            {officiant.affiliation}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 18, color: "#8A7D78" }}>
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
