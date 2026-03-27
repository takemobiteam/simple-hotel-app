import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { parseHotels } from "./lib.js";
import type { Hotel } from "./types.js";
import styles from "./mcp-app.module.css";


function HotelSearchApp() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
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
        setLoading(false);
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
      {loading ? (
        <ul className={styles.hotelList}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ul>
      ) : hotels.length === 0 ? (
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


function SkeletonCard() {
  return (
    <li className={styles.hotelCard}>
      <div className={`${styles.skeleton} ${styles.skeletonImage}`} />
      <div className={styles.hotelInfo}>
        <div className={styles.hotelHeader}>
          <div className={`${styles.skeleton} ${styles.skeletonName}`} />
          <div className={`${styles.skeleton} ${styles.skeletonRate}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonAddress}`} />
      </div>
    </li>
  );
}


function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <li className={styles.hotelCard}>
      {hotel.imageUrls[0] && (
        <img className={styles.hotelImage} src={hotel.imageUrls[0]} alt={hotel.name} />
      )}
      <div className={styles.hotelInfo}>
        <div className={styles.hotelHeader}>
          <h3 className={styles.hotelName}>{hotel.name}</h3>
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
      </div>
    </li>
  );
}


createRoot(document.getElementById("root")!).render(
  <HotelSearchApp />,
);
