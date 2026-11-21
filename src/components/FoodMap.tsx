import { AdvancedMarker, APIProvider, InfoWindow, Map, Pin, useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import { directionsUrl, USF_TAMPA } from '../../shared/geo'
import type { FoodResourceWithDistance, LatLng } from '../../shared/types'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

interface Props {
  resources: FoodResourceWithDistance[]
  recommendedIds: string[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  userLocation: LatLng | null
}

/** Google Map of food resources. Recommended places get a highlighted pin. */
export function FoodMap(props: Props) {
  if (!MAPS_KEY) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center rounded-lg bg-sand p-4 text-center">
        Map unavailable: add VITE_GOOGLE_MAPS_API_KEY to .env
      </div>
    )
  }
  return (
    <APIProvider apiKey={MAPS_KEY}>
      <Map
        className="h-full min-h-72 w-full overflow-hidden rounded-lg"
        defaultCenter={USF_TAMPA}
        defaultZoom={11}
        mapId="DEMO_MAP_ID"
        gestureHandling="greedy"
        disableDefaultUI={false}
        clickableIcons={false}
      >
        <Markers {...props} />
      </Map>
    </APIProvider>
  )
}

function Markers({ resources, recommendedIds, selectedId, onSelect, userLocation }: Props) {
  const map = useMap()
  const selected = resources.find((r) => r.id === selectedId) ?? null

  // Pan to the selected place, or fit the recommended places in view.
  useEffect(() => {
    if (!map) return
    if (selected) {
      map.panTo(selected.location)
      return
    }
    const focus = resources.filter((r) => recommendedIds.includes(r.id))
    if (focus.length === 0) return
    const bounds = new google.maps.LatLngBounds()
    focus.forEach((r) => bounds.extend(r.location))
    if (userLocation) bounds.extend(userLocation)
    map.fitBounds(bounds, 60)
  }, [map, selected, resources, recommendedIds, userLocation])

  return (
    <>
      {userLocation && (
        <AdvancedMarker position={userLocation} title="You are here">
          <span className="block h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow" />
        </AdvancedMarker>
      )}
      <AdvancedMarker position={USF_TAMPA} title="USF Tampa">
        <Pin background="#006747" borderColor="#004d35" glyphColor="#CFC493" />
      </AdvancedMarker>

      {resources.map((r) => {
        const recommended = recommendedIds.includes(r.id)
        return (
          <AdvancedMarker
            key={r.id}
            position={r.location}
            title={r.name}
            onClick={() => onSelect(r.id)}
            zIndex={recommended ? 10 : 1}
          >
            <Pin
              background={recommended ? '#69a657' : r.openNow ? '#5a0058' : '#b3926f'}
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={recommended ? 1.3 : 1}
            />
          </AdvancedMarker>
        )
      })}

      {selected && (
        <InfoWindow position={selected.location} onCloseClick={() => onSelect(null)} pixelOffset={[0, -36]}>
          <div className="max-w-56 text-sm text-slate-900">
            <strong className="block">{selected.name}</strong>
            <span className="block">{selected.address}</span>
            <span className="block">
              {selected.openNow ? 'Open now' : 'Closed now'} · {selected.distanceMiles} mi
            </span>
            <a
              className="text-plum underline"
              href={directionsUrl(selected.location)}
              target="_blank"
              rel="noreferrer"
            >
              Directions
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  )
}
