import React, { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
} from "react-router-dom";

// import { mock } from "./mocks/birdMocks";

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

const ICONS_BASE = "http://maps.google.com/mapfiles/ms/icons/";

const icons = {
  marker: ICONS_BASE + "blue-dot.png",
  selectedMarker: ICONS_BASE + "red-dot.png",
};
// maybe switch with your own? with bird icons or other map icons?

function ReactGoogleMaps(props) {
  const googleAPIkey = "AIzaSyDmmQdWZDkfvNeQ24Mh5dsNVUMPyEX6mBY";
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
    googleMapsApiKey: googleAPIkey,
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
      console.log("MINNIE");
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

export const BirdDetail = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState(-1);

  const { recordings, setRecordings } = props;
  const { id } = useParams();

  const recordingsForThisBird = selectRecordingsForBird(recordings, id);
  // const recordingsForThisBirdExist = recordings.some(rec => rec.birdId === id)
  const recordingsForThisBirdExist = recordingsForThisBird.length > 0;

  console.log("AS", recordingsForThisBirdExist, recordings);

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
      const res = await fetch(detailUrl, {
        method: "GET",
        headers: {
          "API-key": API_KEY,
        },
      });
      const json = await res.json();
      console.log("DETAIL", json);
      const recsList = json.recordings;
      console.log("recs", recsList);

      const normalizedData = recsList.map((rec) => ({
        id: rec.id,
        birdId: id,
        lat: rec.lat,
        lng: rec.lng,
        date: rec.date,
        file: rec.file,
        fileName: rec["file-name"],
        url: rec.url,
        lic: rec.lic,
        loc: rec.loc,
        rec: rec.rec,
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
  }, [id]);

  // console.log("abc", birdDetail)

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
              {/* recording#: {rec.id} location: {rec.lat},{rec.lng} */}
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

  console.log("FiltLoc", filterLocal);

  const { data, statuses, handleSubmit } = props;
  // const {families, orders, statuses} = data
  const stats = statuses || [];

  console.log("123432", data);
  console.log("s34", statuses);

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
        An error occurred loading data
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
    favorites,
    setFavorites,
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
  
  const birdsRefined = data.map((bird) => {
    return showFavorites
      // ? favorites.some((favorite) => favorite === bird.id)
      ? retreivedLikesArray.some((liked) => `${liked}` === bird.id)
      : true;
  })
    .filter(filterFunc)
    .filter((bird) => {
      return showFavorites
        ? favorites.some((favorite) => favorite === bird.id)
        // ? retreivedLikesArray.some((liked) => `${liked}` === bird.id)
        : true;
    })
    .sort((bird1, bird2) => {
      return sortFunc(bird1) >= sortFunc(bird2) ? 1 : -1;
    });

  console.log('BIRDSSSSSSSSS', birdsRefined)

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
            favorites={favorites}
            setFavorites={setFavorites}
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
  const { bird, favorites, setFavorites } = props;
  const { id, name, images } = bird;
  const hasImages = !!images && images.length > 0;
  console.log(bird);

//   const isFavorite = favorites.some((birdId) => birdId === id);

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

//   const imgStyle = {
//     ...birdCardStyles.likeButton,
//     color: isFavorite ? "red" : "black",
//   };

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
        {/* {isFavorite ? "<3<3<3 Favorite Bird!" : "Click to Add to Favorites"} */}
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
  console.log("NNFFT");
  return <div>NotFound, Check if URL is correct</div>;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [favorites, setFavorites] = useState([5, 8]);

  const doFetch = async () => {
    try {
      setLoading(true);
      const res = await fetch(URL, {
        method: "GET",
        headers: {
          "API-key": API_KEY,
        },
      });
      console.log("res", res);
      const json = await res.json();
      // await fetch("http://www.yahoo.com")
      // const json = mock
      console.log("json", json);
      const cleaned = json.map((item) => ({
        id: item.id,
        images: item.images,
        lengthMin: item.lengthMin,
        lengthMax: item.lengthMax,
        name: item.name,
        status: item.status,
        sciName: json.sciName,
        // recordings: json.recordings
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
  }, []);

  return (
    <Router>
      <>
        <div style={{ backgroundColor: "red" }}>Bird Watcher App</div>
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
                // favorites={favorites}
                setFavorites={setFavorites}
              />
            }
          />
          <Route
            path="/birds/:id"
            element={
              <BirdDetail
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
