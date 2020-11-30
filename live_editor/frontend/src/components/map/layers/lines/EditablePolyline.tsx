import React, { useState, useEffect, useMemo } from 'react';
import { Polyline as CorePolyline, LeafletEvent, LatLng, Marker } from 'leaflet';
import { Polyline, PolylineProps, CircleMarker } from 'react-leaflet';
import { omit } from 'lodash';

type EditablePolylineCallbacks = {
  onPositionInserted?: (index: number, pos: LatLng) => void;
  onPositionModified?: (index: number, pos: LatLng) => void;
  onPositionRemoved?: (index: number) => void;
  onPositionClicked?: (index: number) => void;
};

export type EditablePolylineProps = EditablePolylineCallbacks &
  PolylineProps & {
    // TODO obviously this flag should not be here, quick hack for mvp
    editable: boolean;
    nonEditableWpRadius?: number;
  };

class LeafletPolylineEventHandler {
  positions: LatLng[];
  callbacks: EditablePolylineCallbacks;
  redraw: () => void;
  minimumLenght: number;

  constructor(positions: LatLng[], callbacks: EditablePolylineCallbacks, redraw: () => void, minimumLenght = 1) {
    this.positions = positions;
    this.callbacks = callbacks;
    this.redraw = redraw;
    this.minimumLenght = minimumLenght;
  }

  onEdit = (event: LeafletEvent) => {
    const line = event.target as CorePolyline;
    const newPositions = [...(line.getLatLngs() as LatLng[])];
    const oldPositions = this.positions;

    if (newPositions.length < oldPositions.length) {
      if (newPositions.length < this.minimumLenght) {
        console.log('Cannot remove position, minimum lenght is ' + this.minimumLenght);
        this.redraw();
        return;
      }

      const index = this.findChangedPositionIndex(oldPositions, newPositions);
      if (index === 0) {
        console.error('Wp 0 cannot be removed.');
        this.redraw();
        return;
      }
      this.callbacks.onPositionRemoved?.(index);

      this.positions = newPositions;
    }
  };

  onClick = (event: LeafletEvent) => {
    const marker = event.target as Marker;
    const markerLatLng = marker.getLatLng();
    const index = this.positions.findIndex(p => p.equals(markerLatLng));
    this.callbacks.onPositionClicked?.(index);
  };

  onMarkerDragEnd = (event: LeafletEvent) => {
    const line = event.target as CorePolyline;
    const newPositions = [...(line.getLatLngs() as LatLng[])];
    const oldPositions = this.positions;

    if (newPositions.length > oldPositions.length) {
      const index = this.findChangedPositionIndex(newPositions, oldPositions);
      if (this.callbacks.onPositionInserted) {
        this.callbacks.onPositionInserted(index, newPositions[index]);
      }

      this.positions = newPositions;
    } else if (newPositions.length === oldPositions.length) {
      const index = this.findChangedPositionIndex(newPositions, oldPositions);
      if (this.callbacks.onPositionModified) {
        this.callbacks.onPositionModified(index, newPositions[index]);
      }

      this.positions = newPositions;
    }
  };

  onVertedAdded = (event: any) => {
    // Removed for better ux but could crash the client
    // if (this.callbacks.onPositionInserted) {
    //   this.callbacks.onPositionInserted(event.indexPath[0], event.latlng);
    // }
  };

  private findChangedPositionIndex = (positions: LatLng[], oldPositions: LatLng[]): number => {
    const isModified = (pos: LatLng) => oldPositions.some(oldPos => pos.equals(oldPos)) === false;

    const modifiedPositions = positions.filter(newPos => isModified(newPos));
    if (modifiedPositions === undefined || modifiedPositions.length !== 1) {
      console.error('Invalid change: 0 or more than one element changed!');
      return -1;
    }

    const modifiedPosition = modifiedPositions[0];

    const index = positions.findIndex(pos => modifiedPosition.equals(pos));
    console.assert(index !== -1);
    return index;
  };
}

export function EditablePolylineNonMemo(props: EditablePolylineProps) {
  const {
    nonEditableWpRadius: nonEditableWpRadiusProp,
    editable,
    color,
    onPositionInserted,
    onPositionModified,
    onPositionRemoved,
    onPositionClicked
  } = props;
  const positions = props.positions as LatLng[];
  const nonEditableWpRadius = nonEditableWpRadiusProp ? nonEditableWpRadiusProp : 5;

  // Note: There is a bug(?) in Polyline it will not update the markers on change,
  // only the polyline is redrawn.
  // requestRedraw will recreate/redraw the polyline at every change which is not optimal
  // but at least it works with all 3 scenarios and external updates.
  const [savedPositions, setSavedPositions] = useState(positions);
  const [requestRedraw, setRequestRedraw] = useState(false);

  const redraw = () => {
    setRequestRedraw(true);
  };

  const onPolylineAdded = (event: LeafletEvent) => {
    const line = event.target as CorePolyline;

    const polyLineEventHandler = new LeafletPolylineEventHandler(
      positions,
      {
        onPositionInserted: onPositionInserted,
        onPositionModified: onPositionModified,
        onPositionRemoved: onPositionRemoved,
        onPositionClicked: onPositionClicked
      },
      redraw
    );

    line.pm.enable({
      allowSelfIntersections: true,
      preventMarkerRemoval: !editable,
      snappable: false
    });

    if (editable) {
      line.pm._markers[0].dragging.disable();
    } else {
      line.pm.disable();
    }

    line.pm._markers.forEach(m => m.on('click', polyLineEventHandler.onClick));

    // https://github.com/geoman-io/leaflet-geoman
    line.on('pm:edit', polyLineEventHandler.onEdit);
    line.on('pm:markerdragend', polyLineEventHandler.onMarkerDragEnd);
    line.on('pm:vertexadded', polyLineEventHandler.onVertedAdded);
  };

  useEffect(() => {
    setRequestRedraw(false);
  }, [requestRedraw]);

  // Only redraw when positions change
  if (positions !== savedPositions) {
    setSavedPositions(positions);
    setRequestRedraw(true);
  }

  const renderNonEditableWp = (position: LatLng, index: number) => (
    <CircleMarker
      key={`WpMarker_${index}`}
      center={position}
      radius={nonEditableWpRadius}
      fillOpacity={0}
      color={color}
      weight={1}
    />
  );

  if (requestRedraw) {
    return <React.Fragment></React.Fragment>;
  } else {
    return (
      <React.Fragment>
        <Polyline {...omit(props, 'onadd', 'editable')} onadd={onPolylineAdded} />
        {!editable && positions.map((p, i) => renderNonEditableWp(p, i))}
      </React.Fragment>
    );
  }
}

export function EditablePolyline(props: EditablePolylineProps) {
  const { editable, positions } = props;
  const latLngArray = JSON.stringify(positions as LatLng[]);

  const memorizedItem = useMemo(() => <EditablePolylineNonMemo {...props} />, [ // eslint-disable-line react-hooks/exhaustive-deps
    editable,
    latLngArray
  ]);

  return memorizedItem;
}
