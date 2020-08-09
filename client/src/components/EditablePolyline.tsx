import React, { useState, useEffect } from 'react';
import { Polyline as CorePolyline, LeafletEvent, LatLng } from 'leaflet';
import { Polyline, PolylineProps } from 'react-leaflet';
import { omit } from 'lodash';

type EditablePolylineCallbacks = {
  onPositionInserted?: (index: number, pos: LatLng) => void;
  onPositionModified?: (index: number, pos: LatLng) => void;
  onPositionRemoved?: (index: number) => void;
};

export type EditablePolylineProps = EditablePolylineCallbacks & PolylineProps;

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
      if (this.callbacks.onPositionRemoved) {
        this.callbacks.onPositionRemoved(index);
      }

      this.positions = newPositions;
    }
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

  private findChangedPositionIndex = (positions: LatLng[], oldPositions: LatLng[]): number => {
    const isModified = (pos: LatLng) => oldPositions.some(oldPos => pos.equals(oldPos)) === false;

    const modifiedPositions = positions.filter(newPos => isModified(newPos));
    if (modifiedPositions === undefined || modifiedPositions.length !== 1) {
      console.error('Invalid change: 0 or more than one element changed!');
      return -1;
    }
    const modifiedPosition = modifiedPositions[0];

    const index = positions.findIndex(pos => modifiedPosition.equals(pos));
    console.assert(index !== -1); // TODO
    return index;
  };
}

export function EditablePolyline(props: EditablePolylineProps) {
  const { onPositionInserted, onPositionModified, onPositionRemoved } = props;
  const positions = props.positions as LatLng[];

  // Note: There is a bug(?) in Polyline it will not update the markers on change,
  // only the polyline is redrawn.
  // requestRedraw will recreate/redraw the polyline at every change which is not optimal
  // but at least it works with all 3 scenarios and external updates.
  const [savedPositions, setSavePositions] = useState(positions);
  const [requestRedraw, setRequestRedraw] = useState(false);

  const redraw = () => {
    setRequestRedraw(true);
  };

  const onPolylineAdded = (event: LeafletEvent) => {
    const line = event.target as CorePolyline;

    line.pm.enable({
      allowSelfIntersections: true
    });

    line.pm._markers[0].dragging.disable();

    const polyLineEventHandler = new LeafletPolylineEventHandler(
      positions,
      {
        onPositionInserted: onPositionInserted,
        onPositionModified: onPositionModified,
        onPositionRemoved: onPositionRemoved
      },
      redraw
    );

    line.on('pm:edit', polyLineEventHandler.onEdit);
    line.on('pm:markerdragend', polyLineEventHandler.onMarkerDragEnd);
  };

  // Only redraw when positions change
  if (positions !== savedPositions) {
    setSavePositions(positions);
    setRequestRedraw(true);
  }

  useEffect(() => {
    setRequestRedraw(false);
  }, [requestRedraw]);

  if (requestRedraw) {
    return <div></div>;
  } else {
    return <Polyline {...omit(props, 'onadd')} onadd={onPolylineAdded} />;
  }
}
