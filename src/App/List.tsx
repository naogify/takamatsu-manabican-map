import { useState } from 'react';
import NewEvents from './ListContent/NewEvents';
import MarkerDetail from './ListContent/MarkerDetail';
import Search from './ListContent/Search';
import SearchResults from './ListContent/SearchResults';
import { QueryDate } from './utils/types';
import { Feature } from 'geojson';
import geolonia from '@geolonia/embed';
import { queryEventByDate } from './utils/queryEventByDate';
import { showEventsOnMap } from './utils/showEventsOnMap';
import { setPolygonFilter } from './utils/setPolygonFilter';

type Props = {
  isPage: string | null;
  listRef: React.MutableRefObject<HTMLDivElement | null>;
  events: Feature[],
  clickedEvent: Feature | null;
  mapObject: geolonia.Map | null;
  setIsPage: React.Dispatch<React.SetStateAction<string | null>>;
}

const Content = (props: Props) => {
  const { isPage, listRef, events, clickedEvent, mapObject, setIsPage } = props;
  const [eventDetail, setEventDetail] = useState<Feature | null>(null);
  const [queryDate, setQueryDate] = useState<QueryDate>([]);
  const [queryKeyword, setQueryKeyword] = useState<string>('');


  const openListHandler = () => {
    if (listRef.current && !listRef.current.classList.contains('open')) {
      listRef.current.classList.add('open');
    }
  }

  const closeListHandler = (event: any) => {
    if (listRef.current && listRef.current.classList.contains('open')) {
      listRef.current.classList.remove('open');
      setIsPage(null);

      const progressEvents = queryEventByDate(['today'], events);
      showEventsOnMap(progressEvents, mapObject);
      setPolygonFilter(progressEvents, mapObject);

      event.stopPropagation();
    }
  }

  const returnListHandler = () => {

    if (isPage === 'eventDetail') {

      setIsPage(null);

    } else if (isPage === 'searchResultDetail') {

      setIsPage('searchResults');
    }
  }

  const isShowMarkerDetail = isPage === 'eventDetail' || isPage === 'searchResultDetail';

  return (
    <>
      <div id="list" ref={listRef} onClick={openListHandler}>
        <label id="list-close" onClick={closeListHandler}><span></span></label>
        {isShowMarkerDetail && (
          <label id="list-return" onClick={returnListHandler}>
            <img src="./img/arrow-left.svg" alt="一覧に戻る" />
            <span>一覧に戻る</span>
          </label>
        )
        }
        <div id="list-content">
          {!isPage && <NewEvents events={events} isPage={isPage} setIsPage={setIsPage} setEventDetail={setEventDetail} />}
          {isShowMarkerDetail && <MarkerDetail event={eventDetail} />}
          {isPage === 'marker' && <MarkerDetail event={clickedEvent} />}
          {isPage === 'search' && <Search setIsPage={setIsPage} setQueryDate={setQueryDate} setQueryKeyword={setQueryKeyword} />}
          {isPage === 'searchResults' && <SearchResults queryDate={queryDate} queryKeyword={queryKeyword} events={events} setIsPage={setIsPage} isPage={isPage} setEventDetail={setEventDetail} mapObject={mapObject} />}
        </div>
      </div>
    </>
  );
}

export default Content;
