import { useEffect, useRef, useState } from "react";
import { MAP_COLORS } from "@/data/mapColors";
import type { LatLng, MapPoint } from "@/data/types";
import { useLanguage } from "./LanguageProvider";
import { directionsUrl, type TravelMode } from "@/data/resourceFilters";
import { createPortal } from "react-dom";
import { DirectionsAction } from "./DirectionsAction";

interface Props {
  points: MapPoint[];
  origin: LatLng;
  originLabel: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  travelMode?: TravelMode;
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

/**
 * Free map of food places, used when no Google Maps key is connected.
 * Leaflet is loaded only in the browser, after hydration, so this module stays
 * safe to import from a server-rendered route.
 */
export default function ResourceMap({ points, origin, originLabel, selectedId, onSelect, travelMode = "transit" }: Props) {
  const { t } = useLanguage();
  const host = useRef<HTMLDivElement | null>(null);
  const start = useRef(origin);
  const Lref = useRef<typeof import("leaflet") | null>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const group = useRef<import("leaflet").LayerGroup | null>(null);
  const markers = useRef<Record<string, import("leaflet").CircleMarker>>({});
  const pick = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [popups, setPopups] = useState<Array<{ point: MapPoint; node: HTMLDivElement }>>([]);
  pick.current = onSelect;

  useEffect(() => {
    let alive = true;
    let instance: import("leaflet").Map | null = null;
    let observer: ResizeObserver | null = null;

    // The container's size settles after the map is created (sticky column,
    // font loading), so re-measure whenever it changes.
    const onResize = () => instance?.invalidateSize();
    window.addEventListener("resize", onResize);

    void (async () => {
      const L = await import("leaflet");
      if (!alive || !host.current) return;
      instance = L.map(host.current, { scrollWheelZoom: false }).setView([start.current.lat, start.current.lng], 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(instance);
      group.current = L.layerGroup().addTo(instance);
      map.current = instance;
      Lref.current = L;
      setReady(true);
      observer = new ResizeObserver(onResize);
      observer.observe(host.current);
    })();

    return () => {
      alive = false;
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      instance?.remove();
      map.current = null;
      group.current = null;
      Lref.current = null;
      markers.current = {};
      setReady(false);
    };
  }, []);

  // Draw pins whenever the visible places change.
  useEffect(() => {
    const L = Lref.current;
    const m = map.current;
    const g = group.current;
    if (!ready || !L || !m || !g) return;

    g.clearLayers();
    markers.current = {};

    L.marker([origin.lat, origin.lng], {
      title: originLabel,
      keyboard: false,
      icon: L.divIcon({
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${MAP_COLORS.origin};border:2px solid ${MAP_COLORS.ring};box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>`,
      }),
    })
      .bindTooltip(esc(originLabel))
      .addTo(g);

    const popupNodes: Array<{ point: MapPoint; node: HTMLDivElement }> = [];
    for (const p of points) {
      const popup = document.createElement("div");
      popupNodes.push({ point: p, node: popup });
      const pin = L.circleMarker([p.location.lat, p.location.lng], {
        radius: p.id === selectedId ? 14 : 9,
        color: MAP_COLORS.ring,
        weight: p.id === selectedId ? 4 : 2,
        fillColor: p.id === selectedId ? MAP_COLORS.selected : p.open ? MAP_COLORS.open : MAP_COLORS.closed,
        fillOpacity: 1,
      })
        .bindPopup(popup)
        .on("click", () => pick.current(p.id))
        .addTo(g);
      markers.current[p.id] = pin;
    }

    const bounds = L.latLngBounds(points.map((p) => [p.location.lat, p.location.lng] as [number, number]));
    bounds.extend([origin.lat, origin.lng]);
    m.fitBounds(bounds, { paddingTopLeft: [40, 40], paddingBottomRight: [40, 40], maxZoom: 14 });
    setPopups(popupNodes);
  }, [ready, points, origin, originLabel, selectedId, travelMode, t]);

  // Bring the chosen place into view.
  useEffect(() => {
    const m = map.current;
    const pin = selectedId ? markers.current[selectedId] : undefined;
    if (!ready || !m || !pin) return;
    pin.bringToFront();
    m.setView(pin.getLatLng(), Math.max(m.getZoom(), 14));
    pin.openPopup();
  }, [ready, selectedId, points]);

  return <><div ref={host} className="h-full w-full" role="application" aria-label={t("Map of food places")} />{popups.map(({point,node})=>createPortal(<div><strong lang="en" dir="ltr">{point.name}</strong><p lang="en" dir="ltr">{point.address}</p><DirectionsAction url={directionsUrl(point.address,travelMode)} /></div>,node,point.id))}</>;
}
