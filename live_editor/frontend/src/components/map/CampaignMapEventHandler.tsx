import { LeafletEventHandlerFnMap } from 'leaflet';
import { useMapEvents } from 'react-leaflet';

export interface CampaignMapEventHandlerProps {
  eventHandlers?: LeafletEventHandlerFnMap;
}

export function CampaignMapEventHandler(props: CampaignMapEventHandlerProps) {
  // Note: Workaround component as MapContainer eventHandlers is not working
  if (props.eventHandlers) {
    useMapEvents(props.eventHandlers);
  }
  return null;
}
