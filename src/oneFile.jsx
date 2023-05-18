import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  MarkerClusterer,
} from "@react-google-maps/api";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

const IMG_SIZE = 100;
const URL = "https://nuthatch.lastelm.software/birds";
// const API_KEY = "89d7a026-ab1e-43e3-8c04-68ee6ed8cc52"
const API_KEY = "878f02e9-fae1-4b4e-9d54-0d5d26a43f9d";

const SortBy = {
  MIN_LENGTH: "Min Length",
  // MIN_WINGSPAN: 'Min Wingspan',
  MAX_LENGTH: "Max Length",
  // MAX_WINGSPAN: 'Max Wingspan',
  NAME: "Name",
  SCI_NAME: "Scientific Name",
};

// const SortByFunc = {
//   [SortBy.MIN_LENGTH]: b => b.lengthMin,
//   [SortBy.MAX_LENGTH]: b => b.lengthMax,
//   [SortBy.NAME]: b => b.name,
//   [SortBy.SCI_NAME]: b => b.sciName,
// }

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

function ReactGoogleMaps(props) {
  const googleAPIkey = "AIzaSyDmmQdWZDkfvNeQ24Mh5dsNVUMPyEX6mBY";
  const containerStyle = {
    width: "600px",
    height: "600px",
  };
  const center = {
    lat: 37.0902,
    lng: -95.7129,
  };
  const { locsArray } = props;
  const newArr = locsArray.map((loc) => {
    const lat = parseFloat(loc.lat);
    const lng = parseFloat(loc.lng);
  });

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleAPIkey,
  });

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={3.8}>
      {/* <MarkerClusterer averageCenter>
        {(clusterer) => (
          <div> */}
            {locsArray.map((loc) => (
              <Marker
                position={{
                  lat: parseFloat(loc.lat),
                  lng: parseFloat(loc.lng),
                }}
              />
            ))}
          {/* </div>
        )}
      </MarkerClusterer> */}
    </GoogleMap>
  ) : (
    <></>
  );
}

const BirdDetail = (props) => {
  const { recordings, setRecordings } = props;
  const { id } = useParams();
  console.log("xyz", id);
  const doesRecordingExist = recordings.filter((rec) => rec.birdId === id);
  const [obsvLocs, setObsvLocs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const doFetch = async () => {
      const detailUrl = URL + "/" + id;
      console.log(detailUrl);
      const res = await fetch(detailUrl, {
        method: "GET",
        headers: {
          "API-key": API_KEY,
        },
      });
      const json = await res.json();
      console.log("bird", { json });
      const normalizedData = {
        id: json.id,
        birdId: id,
        lat: json.lat,
        lng: json.lng,
        date: json.date,
        file: json.file,
        fileName: json["file-name"],
        url: json.url,
        lic: json.lic,
        loc: json.loc,
        rec: json.rec,
      };
      const observationLocs = json.recordings.map((obsv) => {
        return {
          lat: obsv.lat,
          lng: obsv.lng,
          locName: obsv.loc,
          date: obsv.date,
        };
      });
      //   how to remove repeated lats & longs^^ or can remove repeated dates ?
      setObsvLocs(observationLocs);
      setRecordings([...recordings, normalizedData]);
    };
    doFetch();
  }, [id]);

  return (
    <div>
      <div onClick={() => navigate("/")}>back to exploring birds</div>
      <b>Bird Detail {`Name ${id}`}</b>
      <ReactGoogleMaps locsArray={obsvLocs} />
    </div>
  );
};

function RefinementHeader(props) {
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
          <div>
            <label>
              <input
                type="radio"
                value={sortType}
                checked={sortType === sortLocal}
                onChange={() => setSortLocal(sortType)}
              />
              {sortType}
            </label>
          </div>
        );
      })}
      <p>Filter By Status</p>
      {Object.values(Status).map((stat) => {
        return (
          <div>
            <label>
              <input
                type="checkbox"
                value={stat}
                checked={filterLocal.some((item) => item === stat)}
                onChange={() => handleFilterLocalChange(stat)}
              />
              {stat}
            </label>
          </div>
        );
      })}
      <input type="submit" />
    </form>
  );
}

function PaginationFooter(props) {
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
    <div>
      <div onClick={handlePageBack}>{"<"}</div>
      <div>{page}</div>
      <div onClick={handlePageForward}>{">"}</div>
    </div>
  );
}

const ITEMS_PER_PAGE = 10;

function BirdList(props) {
  const { data, statuses, favorites, setFavorites } = props;
  // const {birds, statuses} = data

  const [page, setPage] = useState(0);
  const [showFavorites, setShowFavorites] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [filterList, setFilterList] = useState(Object.values(Status));

  console.log({ sortBy, filterList, statuses, data });

  const handleSubmit = (sort, filter) => {
    setSortBy(sort);
    setFilterList(filter);
  };

  const sortFunc = getSortByFunc(sortBy);
  const filterFunc = (bird) =>
    filterList.some((status) => bird.status === status);

  const birdsRefined = data
    .filter(filterFunc)
    .filter((bird) => {
      return showFavorites
        ? favorites.some((favorite) => favorite === bird.id)
        : true;
    })
    .sort((bird1, bird2) => {
      return sortFunc(bird1) >= sortFunc(bird2) ? 1 : -1;
    });

  const lastPage = birdsRefined.length / ITEMS_PER_PAGE;

  const birdsPage = birdsRefined.filter((item, idx) => {
    const pageStart = ITEMS_PER_PAGE * page;
    const pageEnd = pageStart + ITEMS_PER_PAGE;
    return idx > pageStart && idx < pageEnd;
  });

  const mockData = [
    {
        name: 'quacker',
        id:1,
    },
    {
        name: 'gooser',
        id:2,
    },
    {
        name: 'ducker',
        id:3,
    },
  ]
  return (
    <div>
      {/* <RefinementHeader {...refinemenHeaderProps}/> */}
      <RefinementHeader
        // data={data}
        data={mockData}
        statuses={statuses}
        handleSubmit={handleSubmit}
        sortBy={sortBy}
        filterList={filterList}
      />
      <button onClick={() => setShowFavorites(!showFavorites)}>
        Toggle Favorites
      </button>
      {mockData.map((bird) => (
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
    </div>
  );
}

function BirdCard(props) {
  const { bird, favorites, setFavorites } = props;
  const { id, name, images } = bird;

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
    <div>
      {/* <Link
        to={{
          pathname: `/birds/${id}`,
          // state: {location: "123"}
        }}
      > */}
        {/* <div>Name:</div> */}
        <div>{name}</div>
        {/* {hasImages && (
          <img src={images[0]} width={4 * IMG_SIZE} height={3 * IMG_SIZE} />
        )} */}
      {/* </Link> */}
      <div
        onClick={handleFavoriteClick}
        // style={{ color: isFavorite ? "red" : "black" }}
      >
        {"<3<3<3"}
      </div>
    </div>
  );
}

function NotFound() {
  console.log("NNFFT");
  return <div>NotFound, Check if URL is correct</div>;
}

function App2() {
  const [data, setData] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [favorites, setFavorites] = useState([5, 8]);

  if (localStorage.getItem('likedFromStorage')===null) localStorage.setItem('likedFromStorage', JSON.stringify([]))

  React.useEffect(() => {
    const doFetch = async () => {
      const res = await fetch(URL, {
        method: "GET",
        headers: {
          "API-key": API_KEY,
        },
      });
      console.log("res", res);
      const json = await res.json();
      console.log("json", json);
      const cleaned = json.map((item) => ({
        id: item.id,
        images: item.images,
        lengthMin: item.lengthMin,
        lengthMax: item.lengthMax,
        name: item.name,
        status: item.status,
        sciName: json.sciName,
        recordings: json.recordings,
      }));
      setData(json);
    };
    // doFetch();
  }, []);

  return (
    <Router>
      <div>
        <div>Bird Watcher App</div>
        <Routes>
          <Route
            path="/"
            element={
              <BirdList
                data={data}
                favorites={favorites}
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
      </div>
    </Router>
  );
}

export default App2;
