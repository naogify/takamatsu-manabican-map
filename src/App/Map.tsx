import React, { useEffect } from 'react';
import SearchControl from './SearchControl';
import { Feature } from 'geojson';
import geolonia from '@geolonia/embed';
import { queryEventByDate } from './utils/queryEventByDate';
import { showEventsOnMap } from './utils/showEventsOnMap';
import { setPolygonFilter } from './utils/setPolygonFilter';

declare global {
  interface Window {
    // @ts-ignore
    geolonia: any;
  }
}

const style = {
  position: 'absolute',
  width: '100%',
  height: '100%',
} as React.CSSProperties;


type Props = {
  setIsPage: React.Dispatch<React.SetStateAction<string | null>>;
  setClickedEvent: React.Dispatch<React.SetStateAction<Feature | null>>;
  setMapObject: React.Dispatch<React.SetStateAction<geolonia.Map | null>>;
  listRef: React.MutableRefObject<HTMLDivElement | null>;
  events: Feature[];
  mapObject: geolonia.Map | null;
}

const Component = (props: Props) => {

  const { listRef, events, mapObject, setIsPage, setClickedEvent, setMapObject } = props;
  const mapContainer = React.useRef(null);

  React.useEffect(() => {

    if (!mapContainer.current) return;

    const map = new window.geolonia.Map({
      container: mapContainer.current,
      zoom: 15,
      center: [134.04862, 34.35188],
      // @ts-ignore
      style: `${process.env.PUBLIC_URL}/style.json`,
      localIdeographFontFamily: 'sans-serif',
      minZoom: 11,
      maxZoom: 19,
    })

    setMapObject(map);

    // @ts-ignore
    map.addControl(new window.geolonia.GeolocateControl(), 'bottom-right');

    const setSearchPage = () => {
      setIsPage('search');
      if (listRef.current && !listRef.current.classList.contains('open')) {
        listRef.current.classList.add('open');
      }
    }
    map.addControl(new SearchControl(setSearchPage), 'bottom-right');

  }, [listRef, setIsPage, setMapObject]);

  useEffect(() => {

    if (!mapObject) return;

    mapObject.on('load', (e: any) => {

      const progressEvents = queryEventByDate(['today'], events);
      showEventsOnMap(progressEvents, mapObject);
      setPolygonFilter(progressEvents, mapObject);

      mapObject.on('click', (e: any) => {

        const features = mapObject.queryRenderedFeatures(e.point);
        if (features.length > 0) {
          const feature = features[0];
          const layerId = feature.layer.id;

          if (layerId === 'takamatsuarea') {

            setClickedEvent(feature);
            setIsPage('marker');
            if (listRef.current && !listRef.current.classList.contains('open')) {
              listRef.current.classList.add('open');
            }
          } else {

            setIsPage(null);
            showEventsOnMap(progressEvents, mapObject);
            if (listRef.current && listRef.current.classList.contains('open')) {
              listRef.current.classList.remove('open');
            }
          }
        }
      })
    })
  }, [events, listRef, mapObject, setClickedEvent, setIsPage]);

  return (
    <>
      <div style={style} ref={mapContainer} data-navigation-control="off" data-gesture-handling="off" />
    </>
  );
}

export default Component;
