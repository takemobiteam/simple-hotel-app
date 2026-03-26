import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import type { Hotel } from "../server.js";
import styles from "./mcp-app.module.css";


function parseHotels(result: CallToolResult): Hotel[] {
  try {
    // structuredContent.text holds the raw JSON string of the hotels array
    const structured = (result as Record<string, unknown>).structuredContent as { text?: string } | undefined;
    if (structured?.text) {
      const parsed = JSON.parse(structured.text);
      if (Array.isArray(parsed)) return parsed;
    }
    // Fallback: content text may be a JSON-encoded envelope { text: "..." }
    const textBlock = result.content?.find((c) => c.type === "text");
    if (!textBlock || textBlock.type !== "text") return [];
    const parsed = JSON.parse(textBlock.text);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed?.text === "string") {
      const inner = JSON.parse(parsed.text);
      return Array.isArray(inner) ? inner : [];
    }
    return [];
  } catch {
    return [];
  }
}


function HotelSearchApp() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: { name: "Hotel Search App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => ({});
      app.onerror = console.error;

      app.ontoolresult = async (result) => {
        console.log("Received tool result:", result);
        setHotels(parseHotels(result));
      };

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  useEffect(() => {
    if (app) setHostContext(app.getHostContext());
  }, [app]);

  if (error) return <div><strong>ERROR:</strong> {error.message}</div>;
  if (!app) return <div>Connecting...</div>;

  return (
    <main
      className={styles.main}
      style={{
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
      }}
    >
      {hotels.length === 0 ? (
        <p className={styles.empty}>No hotels to display.</p>
      ) : (
        <>
          <p className={styles.resultCount}>
            {hotels.length} hotel{hotels.length !== 1 ? "s" : ""} found
          </p>
          <ul className={styles.hotelList}>
            {hotels.map((hotel) => (
              <HotelCard key={hotel.propertyId} hotel={hotel} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}


function StarRating({ stars }: { stars: number }) {
  return (
    <span className={styles.stars} aria-label={`${stars} stars`}>
      {"★".repeat(Math.min(stars, 5))}{"☆".repeat(Math.max(0, 5 - stars))}
    </span>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  const location = [hotel.city, hotel.stateCode, hotel.countryCode].filter(Boolean).join(", ");
  return (
    <li className={styles.hotelCard}>
      {hotel.heroImageUrl && (
        <img className={styles.hotelImage} src={hotel.heroImageUrl} alt={hotel.name} />
      )}
      <div className={styles.hotelInfo}>
        <div className={styles.hotelHeader}>
          <div>
            <h3 className={styles.hotelName}>{hotel.name}</h3>
            <p className={styles.hotelBrand}>{hotel.brand}</p>
          </div>
          {hotel.lowestRate != null && (
            <div className={styles.hotelRate}>
              <span className={styles.rateAmount}>
                {hotel.currency} {hotel.lowestRate.toFixed(0)}
              </span>
              <span className={styles.rateNight}>/night</span>
            </div>
          )}
        </div>
        <p className={styles.hotelAddress}>{hotel.address}</p>
        <p className={styles.hotelLocation}>{location}</p>
        <div className={styles.hotelMeta}>
          <StarRating stars={hotel.starRating} />
          {hotel.guestRating != null && (
            <span className={styles.guestRating}>
              {hotel.guestRating.toFixed(1)} guest rating
              {hotel.reviewCount > 0 && ` (${hotel.reviewCount.toLocaleString()} reviews)`}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}


createRoot(document.getElementById("root")!).render(
  <HotelSearchApp />,
);
