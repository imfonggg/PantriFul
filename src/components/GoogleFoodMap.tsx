/// <reference types="google.maps" />
// Google Maps view of the food places. Imported lazily so the Maps script only
// ever loads in the browser, never during server rendering.
import { APIProvider, InfoWindow, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAP_COLORS } from "@/data/mapColors";
import type { LatLng, MapPoint } from "@/data/types";
import { useLanguage } from "./LanguageProvider";
import { directionsUrl, type TravelMode } from "@/data/resourceFilters";
import { DirectionsAction } from "./DirectionsAction";

const BROWSER_KEY = (import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] ?? import.meta.env["VITE_GOOGLE_MAPS_API_KEY"]) as string | undefined;
const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as string | undefined;

interface Props {
  points: MapPoint[];
  origin: LatLng;
  originLabel: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Called when Google Maps can't draw here, so the free map can take over. */
  onFail: () => void;
  travelMode?: TravelMode;
}

export default function GoogleFoodMap(props: Props) {
  const { onFail, ...rest } = props;
  const [ready, setReady] = useState(false);

  // Keep one stable callback: an inline arrow would restart the timers below
  // on every render and they would never fire.
  const fail = useCallback(() => onFail(), [onFail]);

  // If the map never draws its tiles, hand the space to the free map.
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(fail, 6000);
    return () => clearTimeout(t);
  }, [ready, fail]);

  // Google calls this global when the key is refused for this site (referer,
  // billing or API not enabled). It leaves a blank map, so switch right away.
  useEffect(() => {
    const w = window as unknown as { gm_authFailure?: () => void };
    w.gm_authFailure = fail;
    return () => {
      if (w.gm_authFailure === fail) delete w.gm_authFailure;
    };
  }, [fail]);

  if (!BROWSER_KEY) return null;

  const channel = Number(TRACKING_ID);
  const tracking = Number.isInteger(channel) && channel >= 0 && channel <= 999 ? { channel } : {};

  return (
    <APIProvider apiKey={BROWSER_KEY} onError={() => fail()} {...tracking}>
      <Map
        className="h-full w-full"
        defaultCenter={rest.origin}
        defaultZoom={11}
        gestureHandling="greedy"
        clickableIcons={false}
        internalUsageAttributionIds={["gmp_lovable_agentskills_v1"]}
        onTilesLoaded={() => setReady(true)}
      >
        <MapBody {...rest} onFail={fail} />
      </Map>
    </APIProvider>
  );
}

function MapBody({
  points,
  origin,
  originLabel,
  selectedId,
  onSelect,
  onFail,
  travelMode = "transit",
}: Props) {
  const { t } = useLanguage();
  const map = useMap();
  const selected = points.find((p) => p.id === selectedId) ?? null;
  const warned = useRef(false);

  // Google draws an in-map error box when this domain isn't allowed to use the
  // key. Detect it and swap to the free map rather than leaving it on screen.
  useEffect(() => {
    if (!map || warned.current) return;
    const t = setTimeout(() => {
      if (document.querySelector(".gm-err-container")) {
        warned.current = true;
        onFail();
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [map, onFail]);

  // Bring the chosen place into view, otherwise show every place at once.
  useEffect(() => {
    if (!map) return;
    if (selected) {
      map.panTo(selected.location);
      if ((map.getZoom() ?? 0) < 14) map.setZoom(14);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    points.forEach((p) => bounds.extend(p.location));
    bounds.extend(origin);
    map.fitBounds(bounds, 40);
  }, [map, points, origin, selected]);

  const pin = (color: string, scale: number, strokeWeight = 2) => ({
    path: google.maps.SymbolPath.CIRCLE,
    scale,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: MAP_COLORS.ring,
    strokeWeight,
  });

  return (
    <>
      <Marker position={origin} title={originLabel} icon={pin(MAP_COLORS.origin, 9)} />

      {points.map((p) => (
        <Marker
          key={p.id}
          position={p.location}
          title={p.name}
          zIndex={p.id === selectedId ? 10 : 1}
          onClick={() => onSelect(p.id)}
          icon={p.id === selectedId ? pin(MAP_COLORS.selected, 14, 4) : pin(p.open ? MAP_COLORS.open : MAP_COLORS.closed, 8)}
        />
      ))}

      {selected && (
        <InfoWindow position={selected.location} onCloseClick={() => onSelect(null)} pixelOffset={[0, -26]}>
          <div className="max-w-56 text-sm text-foreground">
            <strong className="block" lang="en" dir="ltr">{selected.name}</strong>
            <span className="block" lang="en" dir="ltr">{selected.address}</span>
            <span className="block">
              {t(!selected.scheduleKnown ? "Hours unconfirmed" : selected.open ? "Scheduled open" : "Outside listed hours")} · {selected.miles.toFixed(1)} mi
            </span>
            <DirectionsAction url={directionsUrl(selected.address, travelMode)} />
          </div>
        </InfoWindow>
      )}
    </>
  );
}
