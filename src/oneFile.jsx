import React, { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
} from "react-router-dom";

import { birdListMock, recordingsToBirdMock } from "./mocks/BirdMocks";

const WIDTH_RATIO = 4;
const HEIGHT_RATIO = 3;
const IMG_SIZE = 100;
const MAP_SIZE = IMG_SIZE * 1.8;
const MAP_CENTER_LAT = 40;
const MAP_CENTER_LNG = -100;
const MAP_ZOOM = 4;
const URL = "https://nuthatch.lastelm.software/birds";
const API_KEY_OLD = "89d7a026-ab1e-43e3-8c04-68ee6ed8cc52";
const API_KEY = "878f02e9-fae1-4b4e-9d54-0d5d26a43f9d";
const GOOGLE_MAPS_API_KEY = "AIzaSyDmmQdWZDkfvNeQ24Mh5dsNVUMPyEX6mBY";

const ICONS_BASE = "http://maps.google.com/mapfiles/ms/icons/";

const icons = {
  marker: ICONS_BASE + "blue-dot.png",
  selectedMarker: ICONS_BASE + "red-dot.png",
}; // maybe switch with your own? with bird icons or other map icons?
function ReactGoogleMaps(props) {
  const containerStyle = {
    width: MAP_SIZE * WIDTH_RATIO,
    height: MAP_SIZE * HEIGHT_RATIO,
  };
  const center = {
    lat: MAP_CENTER_LAT,
    lng: MAP_CENTER_LNG,
  };
  const { locsArray, selectedId, setSelectedId } = props;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const handleMarkerClick = (idx) => {
    setSelectedId(idx);
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={MAP_ZOOM}
    >
      {locsArray.map((loc, idx) => {
        return (
          <Marker
            onClick={() => handleMarkerClick(idx)}
            position={{ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) }}
            icon={idx === selectedId ? icons.selectedMarker : icons.marker}
          />
        );
      })}
    </GoogleMap>
  ) : (
    <></>
  );
}

const SortBy = {
  MIN_LENGTH: "Min Length",
  MAX_LENGTH: "Max Length",
  NAME: "Name",
  SCI_NAME: "Scientific Name",
};

const getSortByFunc = (sortBy) => {
  switch (sortBy) {
    case SortBy.MIN_LENGTH:
      return (b) => b.lengthMin;
    case SortBy.MAX_LENGTH:
      return (b) => b.lengthMax;
    case SortBy.NAME:
      return (b) => b.name;
    case SortBy.SCI_NAME:
      return (b) => b.sciName;
    default:
      return (b) => b.id;
  }
};

const UNKNOWN = "Unknown";

const Status = {
  LOW_CONCERN: "Low Concern",
  RESTRICTED_RANGE: "Restricted Range",
  DECLINING: "Declining",
  RED_WATCH_LIST: "Red Watch List",
  COMMON_BIRD_IN_STEEP_DECLINE: "Common Bird in Steep Decline",
};

function selectRecordingsForBird(recordings, birdId) {
  // Should memoize this ourselves, or use the reselect library, or restructure recordings and data into a normalized object instead of array
  const recs = recordings.filter((rec) => rec.birdId === birdId);
  return recs;
}

function isNil(obj) {
  return obj === null || obj === undefined;
}

export const BirdDetail = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState(-1);

  const { recordings, setRecordings, useMocks } = props;
  const { id } = useParams();

  const recordingsForThisBird = selectRecordingsForBird(recordings, id);
  const recordingsForThisBirdExist = recordingsForThisBird.length > 0;

  const handleSelectClick = (idx) => {
    setSelectedId(idx);
  };

  const handleReload = () => {
    doFetch();
  };

  const doFetch = async () => {
    try {
      setLoading(true);
      const detailUrl = URL + "/" + id;
      let json = recordingsToBirdMock[id];
      if (!useMocks) {
        // throw new Error
        const res = await fetch(detailUrl, {
          method: "GET",
          headers: {
            "API-key": API_KEY,
          },
        });
        json = await res.json();
      }
      const recsList = json.recordings || [];

      const normalizedData = recsList
        .filter((rec) => {
          console.log(typeof rec.lat, typeof rec.lng, typeof rec.id);
          return !isNil(rec.lat) && !isNil(rec.lng) && !isNil(rec.id);
        })
        .map((rec) => ({
          id: rec.id,
          birdId: id,
          lat: rec.lat,
          lng: rec.lng,
          date: rec.date || UNKNOWN,
          file: rec.file || UNKNOWN,
          fileName: rec["file-name"] || UNKNOWN,
          url: rec.url || UNKNOWN,
          lic: rec.lic || UNKNOWN,
          loc: rec.loc || UNKNOWN,
          rec: rec.rec || UNKNOWN,
        }));
      setRecordings([...recordings, ...normalizedData]);
      setLoading(false);
      setError(false);
    } catch (e) {
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    if (!recordingsForThisBirdExist) {
      doFetch();
    }
  }, [id, useMocks]);


  return (
    <ErrorHandler
      error={error && !recordingsForThisBirdExist}
      handleReload={handleReload}
    >
      <LoadingIndicator loading={loading}>
        Bird Detail
        <>{`Name ${id}`}</>
        <ReactGoogleMaps
          locsArray={recordings}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
        />
        {recordings.map((rec, recId) => {
          return (
            <div
              style={{ color: recId === selectedId ? "red" : "black" }}
              onClick={() => handleSelectClick(recId)}
            >
              recording#: {rec.id} location: date: {rec.date} location:{" "}
              {rec.loc}
            </div>
          );
        })}
      </LoadingIndicator>
    </ErrorHandler>
  );
};

export function RefinementHeader(props) {
  const [sortLocal, setSortLocal] = useState(props.sortBy);
  const [filterLocal, setFilterLocal] = useState(props.filterList);

  const { data, statuses, handleSubmit } = props;
  const stats = statuses || [];

  const handleFilterLocalChange = (filter) => {
    if (filterLocal.some((item) => item === filter)) {
      setFilterLocal(filterLocal.filter((item) => item !== filter));
    } else {
      setFilterLocal([...filterLocal, filter]);
    }
  };

  const handleSubmitLocal = (event) => {
    event.preventDefault();
    handleSubmit(sortLocal, filterLocal);
  };

  return (
    <form onSubmit={handleSubmitLocal}>
      <p>Sort By</p>
      {Object.values(SortBy).map((sortType) => {
        return (
          <>
            <label>
              <input
                type="radio"
                value={sortType}
                checked={sortType === sortLocal}
                onChange={() => setSortLocal(sortType)}
              />
              {sortType}
            </label>
          </>
        );
      })}
      <p>Filter By Status</p>
      {Object.values(Status).map((stat) => {
        return (
          <>
            <label>
              <input
                type="checkbox"
                value={stat}
                checked={filterLocal.some((item) => item === stat)}
                onChange={() => handleFilterLocalChange(stat)}
              />
              {stat}
            </label>
          </>
        );
      })}
      <input type="submit" />
    </form>
  );
}

export function PaginationFooter(props) {
  const { page, handleSetPage, lastPage } = props;

  const handlePageBack = () => {
    if (page > 0) {
      handleSetPage(page - 1);
    }
  };

  const handlePageForward = () => {
    if (page < lastPage) {
      handleSetPage(page + 1);
    }
  };

  return (
    <>
      <div onClick={handlePageBack}>{"<"}</div>
      <div>{page}</div>
      <div onClick={handlePageForward}>{">"}</div>
    </>
  );
}

export function ErrorHandler(props) {
  const { error, handleReload, children } = props;
  if (error) {
    return (
      <>
        An error occurred while loading data. Click "Use Mocks" on top if you
        would like to test the app offline
        <div onClick={handleReload}>Reload</div>
      </>
    );
  } else {
    return children;
  }
}

export function LoadingIndicator(props) {
  const { loading, children } = props;
  if (loading) {
    return <>Loading...</>;
  } else {
    return children;
  }
}

const ITEMS_PER_PAGE = 10;

export function BirdList(props) {
  const {
    data,
    doFetch,
    loading,
    error,
    itemsPerPage = ITEMS_PER_PAGE,
    showFavoritesDefault = false,
  } = props;

  const [page, setPage] = useState(0);
  const [showFavorites, setShowFavorites] = useState(showFavoritesDefault);
  const [sortBy, setSortBy] = useState(null);
  const [filterList, setFilterList] = useState(Object.values(Status));

  const handleSubmit = (sort, filter) => {
    setSortBy(sort);
    setFilterList(filter);
  };

  const handleReload = () => {
    doFetch();
  };

  const sortFunc = getSortByFunc(sortBy);
  const filterFunc = (bird) =>
    filterList.some((status) => bird.status === status);


    const retreivedLikesString = localStorage.getItem('likedFromStorage')
    const retreivedLikesArray = JSON.parse(retreivedLikesString) 
  const birdsRefined = data
    .filter(filterFunc)
    .filter((bird) => {
      return showFavorites
        ? retreivedLikesArray.some((likedId) => likedId === bird.id)
        : true;
    })
    .sort((bird1, bird2) => {
      return sortFunc(bird1) >= sortFunc(bird2) ? 1 : -1;
    });

  const lastPage = birdsRefined.length / itemsPerPage;

  const birdsPage = birdsRefined.filter((item, idx) => {
    const pageStart = itemsPerPage * page;
    const pageEnd = pageStart + itemsPerPage;
    return idx > pageStart && idx < pageEnd;
  });

  console.log({ loading, error });

  return (
    <ErrorHandler error={error} handleReload={handleReload}>
      <LoadingIndicator loading={loading}>
        <RefinementHeader
          data={data}
          handleSubmit={handleSubmit}
          sortBy={sortBy}
          filterList={filterList}
        />
        <button onClick={() => setShowFavorites(!showFavorites)}>
          Toggle Favorites
        </button>
        {birdsPage.map((bird) => (
          <BirdCard
            bird={bird}
          />
        ))}
        <PaginationFooter
          page={page}
          handleSetPage={(page) => setPage(page)}
          lastPage={lastPage}
        />
      </LoadingIndicator>
    </ErrorHandler>
  );
}

export function BirdCard(props) {
  const { bird } = props;
  const { id, name, images } = bird;
  const hasImages = !!images && images.length > 0;

  const handleFavoriteClick = () => {
    let newLikesArr;
    const retreivedLikesString = localStorage.getItem('likedFromStorage')
    const retreivedLikesArray = JSON.parse(retreivedLikesString)
    if (retreivedLikesArray===null) localStorage.setItem('likedFromStorage', JSON.stringify([]))
    if (retreivedLikesArray?.includes(id)) {
        newLikesArr = retreivedLikesArray?.filter(likedId => likedId!==id)
    } else {
        newLikesArr = [...retreivedLikesArray, id]
    }
    localStorage.setItem('likedFromStorage', JSON.stringify(newLikesArr))
  };


  return (
    <>
      <Link
        to={{
          pathname: `/birds/${id}`,
        }}
      >
        <div>{name}</div>
        {hasImages && (
          <img
            style={birdCardStyles.image}
            alt={`${name} bird`}
            src={images[0]}
            width={WIDTH_RATIO * IMG_SIZE}
            height={HEIGHT_RATIO * IMG_SIZE}
          />
        )}
      </Link>
      <div onClick={handleFavoriteClick}>
        {"<3<3<3"}
      </div>
    </>
  );
}

const birdCardStyles = {
  image: {
    border: "12px solid red",
  },
  likeButton: {
    color: "white",
    backgroundColor: "grey",
  },
};

export function NotFound() {
  return <div>NotFound, Check if URL is correct</div>;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [useMocks, setUseMocks] = useState(false);

  const doFetch = async () => {
    try {
      setLoading(true);
      let json = birdListMock;
      if (!useMocks) {
        const res = await fetch(URL, {
          method: "GET",
          headers: {
            "API-key": API_KEY,
          },
        });
        json = await res.json();
      }
      const cleaned = json
        .filter((item) => {
          console.log(typeof item.id, typeof item.name);
          // return typeof(item.id === 'number') && typeof(item.name === 'string')
          return !isNil(item.id) && !isNil(item.name);
        })
        .map((item) => ({
          id: item.id,
          name: item.name,
          images: item.images || [],
          lengthMin: item.lengthMin || 0,
          lengthMax: item.lengthMax || 0,
          status: Object.values(Status).some((stat) => stat === item.status)
            ? item.status
            : UNKNOWN,
          sciName: json.sciName || UNKNOWN,
        }));
      // throw new Error
      console.log(`Successful: API call to ${URL}`);
      setData(cleaned);
      setError(false);
      setLoading(false);
    } catch (e) {
      console.log(`Error API call to ${URL}`);
      setError(true);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    doFetch();
  }, [useMocks]);

  return (
    <Router>
      <>
        <div style={{ backgroundColor: "red" }}>Bird Watcher App</div>
        <div onClick={() => setUseMocks(!useMocks)}>
          {useMocks
            ? "Using Mock Data. Click to Use Live Data"
            : "Using Live Data. Click to Use Mock Data"}
        </div>
        <Routes>
          <Route
            path="/"
            element={
              <BirdList
                doFetch={doFetch}
                data={data}
                setLoading={setLoading}
                loading={loading}
                error={error}
              />
            }
          />
          <Route
            path="/birds/:id"
            element={
              <BirdDetail
                useMocks={useMocks}
                data={data}
                recordings={recordings}
                setRecordings={setRecordings}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <div>About Us</div>
      </>
    </Router>
  );
}

export default App;
