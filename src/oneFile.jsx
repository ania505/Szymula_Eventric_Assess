import React, { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  useNavigate,
} from "react-router-dom";
import SiteTitle2 from "./icons/SiteTitle2.png";
import Filter2 from "./icons/Filter2.png";
import FilledHeart3 from "./icons/FilledHeart3.png";
import HeartOutline from "./icons/HeartOutline.png";
import BirdIcon from "./icons/BirdIcon.png";
import NoImageIcon from "./icons/NoImageIcon.png";
import ArrowLeft2 from "./icons/ArrowLeft2.png";
import ArrowRight2 from "./icons/ArrowRight2.png";
import xIcon3 from "./icons/xIcon3.png";
import BirdRoller from "./icons/BirdRoller.gif";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

import "./styles.css";

import { birdListMock, recordingsToBirdMock } from "./mocks/birdMocks";

const WIDTH_RATIO = 3;
const HEIGHT_RATIO = 2;
const MAP_SIZE = 150 * 1.3;
const MAP_CENTER_LAT = 40;
const MAP_CENTER_LNG = -100;
const MAP_ZOOM = 3;
const URL = "https://nuthatch.lastelm.software/birds";
const API_KEY_OLD = "89d7a026-ab1e-43e3-8c04-68ee6ed8cc52";
const API_KEY = "878f02e9-fae1-4b4e-9d54-0d5d26a43f9d";
const GOOGLE_MAPS_API_KEY = "AIzaSyDmmQdWZDkfvNeQ24Mh5dsNVUMPyEX6mBY";

const ICONS_BASE = "http://maps.google.com/mapfiles/ms/icons/";

const icons = {
  marker: ICONS_BASE + "blue-dot.png",
  selectedMarker: ICONS_BASE + "red-dot.png",
}; 
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
  const recs = recordings.filter((rec) => rec.birdId === birdId);
  return recs;
}

function isNil(obj) {
  return obj === null || obj === undefined;
}

export const BirdDetail = (props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState(-1);
  // const [birdDetails, setBirdDetails] = useState()

  console.log('propPSSSSS', props)
  const { recordings, setRecordings, useMocks, data } = props;
  const { id } = useParams();
  console.log('for currbird', data)
  const currentBird = data.filter(bird => bird.id === parseInt(id))[0]
  console.log('curr bird', currentBird)

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
      // console.log("JSONNNN", json);

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
      // setBirdDetails(json)
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

  const selectedRec = recordings.filter((rec, recId) => recId === selectedId)[0];
  // const selectedRecArr = recordings.map((rec, recId) => {
  //   console.log(rec, typeof selectedId)
  //   // rec.id === selectedId
  // });
  console.log('selectedRecArr', selectedId, selectedRec)

  // const hasImages = !!birdDetails.images && birdDetails.images.length > 0;

  // console.log({birdDetails})
  return (
    <ErrorHandler
      error={error && !recordingsForThisBirdExist}
      handleReload={handleReload}
    >
      <LoadingIndicator loading={loading}>
        <div className="back-button" onClick={() => navigate("/")}>
          <img className="back-arrow" src={ArrowLeft2} alt="arrowLeft"/>
          <div className="back-text">Back</div>
        </div>
        <div className="detail-container">
          <div className="img-and-info">
            <img
              className="bird-card-img"
              src={currentBird?.images[0] || NoImageIcon}
              alt={`${currentBird?.name}Bird`}
            />
            <div className="info">
              <div className="top-info-and-like">
                <div className="top-info">
                  <b className="name">{currentBird?.name}</b>
                  <i className="sci-name">{currentBird?.sciName}</i>
                </div>
                <AddToFlock birdId={id} />
              </div>
              <div className="other-info">
                <div className="smaller-info-text">Status: {currentBird?.status}</div>
                <div className="smaller-info-text">Length Min: {currentBird?.lengthMin}</div>
                <div className="smaller-info-text">Length Max: {currentBird?.lengthMax}</div>
              </div>
            </div>
          </div>
          <ReactGoogleMaps
            locsArray={recordings}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
          {/* {console.log('selected:', selectedId)} */}
          {selectedRec !== -1 && (
            <div className="selected-rec">
              {/* {console.log({selectedRec})} */}
              <div className="rec-num">
                Recording#: {selectedRec?.id}
              </div>
              <div className="rec-num">
                Date: {selectedRec?.date}
              </div>
              <div className="rec-num">
                Location: {selectedRec?.loc}
              </div>
            </div>
          )}
        </div>
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

  const popupStyling = {
    borderRadius: "10px",
    width: "23rem",
    // border: '2px dashed green',
  };

  return (
    <Popup
        contentStyle={popupStyling}
        trigger={
          <div className="refinement-container">
            <div className="refinement-button">
              <div className="icon-wrapper">
                <img className="filter-icon" src={Filter2} alt="filterIcon" />
              </div>
              <div className="refinement-text">Filters & Sort By</div>
            </div>
          </div>
        }
        modal
        nested
      >
        {(close) => (
          <div className="modal">
            <div className="content">
              <div className="modal-top">
                <b className="modal-title">List Refinement</b>
                <div className="x" onClick={() => close()}>
                  <img className="x-img" src={xIcon3} alt="xIcon" />
                </div>
              </div>
              <form onSubmit={handleSubmitLocal}>
                <b>Sort By</b>
                <div className="options">
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
                </div>
                <b>Filter By Status</b>
                <div className="options">
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
                </div>
                <div className="input-wrapper" > 
                  <input type="submit" className="apply-button" />
                  <div className="close-button" onClick={() => close()}>Close</div>
                </div>
            </form>
            </div>
          </div>
        )}
      </Popup>
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
    <div className="pagination">
      <div onClick={handlePageBack}>
        <img className="arrows" src={ArrowLeft2} alt="arrowLeft"/>
      </div>
      <div className="page-text">{page+1}</div>
      <div onClick={handlePageForward}>
        <img className="arrows" src={ArrowRight2} alt="arrowRight"/></div>
    </div>
  );
}

export function ErrorHandler(props) {
  const { error, handleReload, children } = props;
  if (error) {
    return (
      <>
        An error occurred while loading data. Click "Use Mocks" at the bottom of
        the page if you would like to test the application offline.
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
    // return <>Loading...</>;
    return (
      <div className="loader">
        <img className="bird-loader" src={BirdRoller} alt="birdLoader"/>
        <div>Loading...</div>
      </div>
    )
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

  const retreivedLikesString = localStorage.getItem("likedFromStorage");
  const retreivedLikesArray = JSON.parse(retreivedLikesString);
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
        <div className="refine-and-flock">
          <RefinementHeader
            data={data}
            handleSubmit={handleSubmit}
            sortBy={sortBy}
            filterList={filterList}
          />
          <div className="my-flock" onClick={() => setShowFavorites(!showFavorites)}>
            <div className="heart-icon-wrapper">
              <img className="heart-img" src={showFavorites ? BirdIcon : FilledHeart3} alt="filledHeart" />
            </div>
            <div className="flock-text">{showFavorites ? "View More Birds" : "View My Flock"}</div>
          </div>
        </div>
        <PaginationFooter
          page={page}
          handleSetPage={(page) => setPage(page)}
          lastPage={lastPage}
        />
        {birdsPage.map((bird) => (
          <BirdCard bird={bird} />
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

export function AddToFlock(props) {
  const { birdId } = props;
  const id = parseInt(birdId);
  const [liked, setLiked] = useState()
  const handleFavoriteClick = () => {
    const retreivedLikesString = localStorage.getItem("likedFromStorage");
    const retreivedLikesArray = JSON.parse(retreivedLikesString);
    setLiked(retreivedLikesArray.includes(id))
    let newLikesArr;
    if (retreivedLikesArray.includes(id)) {
      newLikesArr = retreivedLikesArray.filter((likedId) => likedId !== id)
      setLiked(false)
    } else {
      newLikesArr = [...retreivedLikesArray, id]
      setLiked(true)
    }
    localStorage.setItem("likedFromStorage", JSON.stringify(newLikesArr));
  };

  return <div onClick={handleFavoriteClick}>
    <div className="card-heart-icon-wrapper">
      <img className="card-heart-img" src={liked ? FilledHeart3 : HeartOutline} alt="filledHeart" />
    </div>
  </div>;
}

export function BirdCard(props) {
  const { bird } = props;
  const { id, name, sciName, lengthMin, lengthMax, status, images } = bird;
  const hasImages = !!images && images.length > 0;
  const navigate = useNavigate();

  return (
    <>
      <div className="card-container" onClick={() => navigate(`/birds/${id}`)}>
          <div className="bird-card-img-wrapper">
            <img
              className="bird-card-img"
              src={hasImages ? images[0] : NoImageIcon}
              alt={`${name}Bird`}
            />
          </div>
        <div className="info-and-fav">
          <div className="info-text">
            <b className="name-text">{name}</b>
            <i className="name-text">{sciName}</i>
            <div className="other-info">
              <div>Status: {status}</div>
              <div>Length: {lengthMin} - {lengthMax}</div>
            </div>
          </div>
          <AddToFlock birdId={id} />
          {/* TODO: wanting to like takes you to bird detail bc whole card is nav to that */}
        </div>
      </div>
    </>
  );
}

export function NotFound() {
  return <div>NotFound, Check if URL is correct</div>;
}

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [useMocks, setUseMocks] = useState(false);

  const retreivedLikesString = localStorage.getItem("likedFromStorage");
  const retreivedLikesArray = JSON.parse(retreivedLikesString);
  if (retreivedLikesArray === null) {
    localStorage.setItem("likedFromStorage", JSON.stringify([]));
  }

  const doFetch = async () => {
    try {
      setLoading(true);
      let json = birdListMock;
      if (!useMocks) {
        const res = await fetch(URL, {
          method: "GET",
          headers: {
            "API-key": API_KEY_OLD,
          },
        });
        json = await res.json();
      }
      const cleaned = json
        .filter((item) => {
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

  console.log('in app', data)

  return (
    <Router>
      <>
        {/* <div className="header-container" onClick={useNavigate('/')}> */}
        {/* ^^ useNavigate() may be used only in the context of a <Router> component */}
        <div className="header-container">
          <div className="main-header">
            <div className="site-img-wrapper">
              <img src={SiteTitle2} alt="siteTitle" />
            </div>
          </div>
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
        <div className="data-type-use" onClick={() => setUseMocks(!useMocks)}>
          {useMocks
            ? "Using Mock Data. Click to Use Live Data."
            : "Using Live Data. Click to Use Mock Data."}
        </div>
      </>
    </Router>
  );
}

export default App;
