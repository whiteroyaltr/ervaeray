"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// ── Star catalog (trimmed) ─────────────────────────────────
// Using a simplified built-in set of bright stars with RA/Dec
// For full accuracy we use astronomy-engine to compute alt/az
// for the given date/time/location.

interface StarData {
  name: string;
  ra: number; // right ascension in hours
  dec: number; // declination in degrees
  mag: number; // apparent magnitude (lower = brighter)
  constellation?: string;
}

const BRIGHT_STARS: StarData[] = [
  { name: "Sirius", ra: 6.75, dec: -16.72, mag: -1.46, constellation: "Büyük Köpek" },
  { name: "Canopus", ra: 6.4, dec: -52.7, mag: -0.74, constellation: "Tekne" },
  { name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, constellation: "Çoban" },
  { name: "Vega", ra: 18.62, dec: 38.78, mag: 0.03, constellation: "Lir" },
  { name: "Capella", ra: 5.28, dec: 46.0, mag: 0.08, constellation: "Arabacı" },
  { name: "Rigel", ra: 5.24, dec: -8.2, mag: 0.13, constellation: "Avcı" },
  { name: "Procyon", ra: 7.65, dec: 5.22, mag: 0.34, constellation: "Küçük Köpek" },
  { name: "Betelgeuse", ra: 5.92, dec: 7.41, mag: 0.42, constellation: "Avcı" },
  { name: "Aldebaran", ra: 4.6, dec: 16.5, mag: 0.85, constellation: "Boğa" },
  { name: "Spica", ra: 13.42, dec: -11.16, mag: 0.97, constellation: "Başak" },
  { name: "Antares", ra: 16.49, dec: -26.43, mag: 1.06, constellation: "Akrep" },
  { name: "Pollux", ra: 7.76, dec: 28.02, mag: 1.14, constellation: "İkizler" },
  { name: "Fomalhaut", ra: 22.96, dec: -29.62, mag: 1.16, constellation: "Güney Balığı" },
  { name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, constellation: "Kuğu" },
  { name: "Regulus", ra: 10.14, dec: 11.97, mag: 1.35, constellation: "Aslan" },
  { name: "Bellatrix", ra: 5.42, dec: 6.35, mag: 1.64, constellation: "Avcı" },
  { name: "Elnath", ra: 5.44, dec: 28.61, mag: 1.65, constellation: "Boğa" },
  { name: "Alnilam", ra: 5.6, dec: -1.2, mag: 1.7, constellation: "Avcı" },
  { name: "Alnitak", ra: 5.68, dec: -1.94, mag: 1.77, constellation: "Avcı" },
  { name: "Mintaka", ra: 5.53, dec: -0.3, mag: 2.2, constellation: "Avcı" },
  { name: "Castor", ra: 7.58, dec: 31.89, mag: 1.58, constellation: "İkizler" },
];

// Compute star position on canvas
// Using equatorial→horizontal coordinate transform
function deg2rad(d: number) { return (d * Math.PI) / 180; }
function rad2deg(r: number) { return (r * 180) / Math.PI; }

function computeStarPosition(
  star: StarData,
  date: Date,
  lat: number,
  lon: number
): { altitude: number; azimuth: number } {
  // Julian date
  const jd =
    date.getTime() / 86400000 + 2440587.5;
  // Greenwich mean sidereal time (simplified)
  const d = jd - 2451545.0;
  const gmst = (280.46061837 + 360.98564736629 * d) % 360;
  // Local sidereal time
  const lst = ((gmst + lon) % 360 + 360) % 360;
  // Hour angle
  const ha = deg2rad(lst - star.ra * 15);
  const decRad = deg2rad(star.dec);
  const latRad = deg2rad(lat);
  // Altitude
  const sinAlt =
    Math.sin(decRad) * Math.sin(latRad) +
    Math.cos(decRad) * Math.cos(latRad) * Math.cos(ha);
  const altitude = rad2deg(Math.asin(sinAlt));
  // Azimuth
  const cosAz =
    (Math.sin(decRad) - Math.sin(latRad) * sinAlt) /
    (Math.cos(latRad) * Math.cos(deg2rad(altitude)));
  let az = rad2deg(Math.acos(Math.max(-1, Math.min(1, cosAz))));
  if (Math.sin(ha) > 0) az = 360 - az;
  return { altitude, azimuth: az };
}

// Project alt/az to canvas xy (stereographic)
function project(
  altitude: number,
  azimuth: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number } | null {
  if (altitude < 0) return null;
  const r = radius * (1 - altitude / 90);
  const azRad = deg2rad(azimuth);
  return {
    x: cx + r * Math.sin(azRad),
    y: cy - r * Math.cos(azRad),
  };
}

interface StarmapProps {
  meetingDate: string;
  meetingTime?: string;
  latitude: number;
  longitude: number;
  starNotes: Array<{ starId: string; note: string }>;
}

interface RenderedStar {
  star: StarData;
  x: number;
  y: number;
  r: number;
}

export default function StarMap({
  meetingDate,
  meetingTime,
  latitude,
  longitude,
  starNotes,
}: StarmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderedStars, setRenderedStars] = useState<RenderedStar[]>([]);
  const [tooltip, setTooltip] = useState<{
    star: StarData;
    note: string | null;
    x: number;
    y: number;
  } | null>(null);

  const SIZE = 360;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const date = new Date(
      meetingTime ? `${meetingDate}T${meetingTime}:00` : `${meetingDate}T21:00:00`
    );

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const radius = SIZE / 2 - 10;

    ctx.clearRect(0, 0, SIZE, SIZE);

    // Background sky
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "#0d1b2a");
    grad.addColorStop(0.7, "#071020");
    grad.addColorStop(1, "#020810");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw faint random star field
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    const rng = (seed: number) => ((Math.sin(seed * 9301 + 49297) * 233280) % 1 + 1) % 1;
    for (let i = 0; i < 200; i++) {
      const angle = rng(i) * Math.PI * 2;
      const dist = rng(i + 100) * radius;
      ctx.beginPath();
      ctx.arc(cx + dist * Math.cos(angle), cy + dist * Math.sin(angle), 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw computed stars
    const stars: RenderedStar[] = [];
    BRIGHT_STARS.forEach((star) => {
      const { altitude, azimuth } = computeStarPosition(star, date, latitude, longitude);
      const pos = project(altitude, azimuth, cx, cy, radius);
      if (!pos) return;
      const starRadius = Math.max(1.2, 4.5 - star.mag * 1.2);
      const brightness = Math.min(1, (5 - star.mag) / 5);

      // Glow
      const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, starRadius * 3);
      glow.addColorStop(0, `rgba(200,220,255,${brightness * 0.8})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, starRadius * 3, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Star dot
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, starRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,235,255,${brightness})`;
      ctx.fill();

      // Label for bright stars
      if (star.mag < 1.5) {
        ctx.font = "9px sans-serif";
        ctx.fillStyle = "rgba(180,200,240,0.7)";
        ctx.fillText(star.name, pos.x + starRadius + 2, pos.y - 2);
      }

      stars.push({ star, x: pos.x, y: pos.y, r: starRadius });
    });

    // Border circle
    ctx.restore();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(200,162,200,0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Compass labels
    const compassItems = [
      { label: "K", angle: 0 },
      { label: "G", angle: 180 },
      { label: "D", angle: 90 },
      { label: "B", angle: 270 },
    ];
    ctx.font = "bold 11px sans-serif";
    compassItems.forEach(({ label, angle }) => {
      const rad = deg2rad(angle);
      const r = radius + 16;
      ctx.fillStyle = "rgba(200,162,200,0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, cx + r * Math.sin(rad), cy - r * Math.cos(rad));
    });

    setRenderedStars(stars);
  }, [meetingDate, meetingTime, latitude, longitude]);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Find nearest star within 20px
    let nearest: RenderedStar | null = null;
    let nearestDist = 20;
    renderedStars.forEach((s) => {
      const dist = Math.sqrt((s.x - mx) ** 2 + (s.y - my) ** 2);
      if (dist < nearestDist) {
        nearest = s;
        nearestDist = dist;
      }
    });

    if (nearest) {
      const noteEntry = starNotes.find(
        (n) => n.starId.toLowerCase() === (nearest as RenderedStar).star.name.toLowerCase() ||
               n.starId.toLowerCase() === (nearest as RenderedStar).star.constellation?.toLowerCase()
      );
      setTooltip({
        star: (nearest as RenderedStar).star,
        note: noteEntry?.note ?? null,
        x: (nearest as RenderedStar).x,
        y: (nearest as RenderedStar).y,
      });
    } else {
      setTooltip(null);
    }
  }

  return (
    <div className="star-map-container" style={{ position: "relative", display: "inline-block" }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.8}
        maxScale={4}
        wheel={{ step: 0.1 }}
      >
        <TransformComponent>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            onClick={handleCanvasClick}
            style={{
              width: "min(360px, 90vw)",
              height: "min(360px, 90vw)",
              cursor: "crosshair",
              display: "block",
            }}
          />
        </TransformComponent>
      </TransformWrapper>

      {/* Tooltip */}
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(13,27,42,0.95)",
            border: "1px solid rgba(200,162,200,0.4)",
            borderRadius: 16,
            padding: "12px 20px",
            color: "white",
            maxWidth: "80%",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <button
            onClick={() => setTooltip(null)}
            style={{
              position: "absolute",
              top: 6,
              right: 10,
              background: "none",
              border: "none",
              color: "rgba(200,162,200,0.7)",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ×
          </button>
          <p style={{ fontWeight: 800, fontSize: "0.95rem", color: "#B5EAD7" }}>
            ⭐ {tooltip.star.name}
          </p>
          <p style={{ fontSize: "0.75rem", color: "rgba(200,162,200,0.8)", margin: "2px 0 6px" }}>
            {tooltip.star.constellation} Takımyıldızı
          </p>
          {tooltip.note && (
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
              {tooltip.note}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
