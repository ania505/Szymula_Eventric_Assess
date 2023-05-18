import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import birdLoader from './icons/birdRoller.gif'

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
        {locsArray.map((loc) => (
            <Marker
                position={{
                    lat: parseFloat(loc.lat),
                    lng: parseFloat(loc.lng),
                }}
            />
        ))}
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

  const bird1 = {"images":["https://images.unsplash.com/photo-1590182556565-9690c2b68c44"],"lengthMin":"14","recordings":[{"date":"2012-06-17","loc":"Joachim Bible Refuge, Green County, Tennessee","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-nd/2.5/","type":"song","gen":"Spiza","rmk":"img:http://www.flickr.com/photos/madbirder/7400478572/","ssp":"","rec":"Mike Nelson","file":"https://xeno-canto.org/103961/download","playback-used":"no","uploaded":"2012-06-19","id":"103961","sp":"americana","lat":"36.157","lng":"-83.083","bird-seen":"yes","sono":{"small":"//xeno-canto.org/sounds/uploaded/PWDLINYMKL/ffts/XC103961-small.png","large":"//xeno-canto.org/sounds/uploaded/PWDLINYMKL/ffts/XC103961-large.png","med":"//xeno-canto.org/sounds/uploaded/PWDLINYMKL/ffts/XC103961-med.png","full":"//xeno-canto.org/sounds/uploaded/PWDLINYMKL/ffts/XC103961-full.png"},"length":"0:15","cnt":"United States","alt":"300","en":"Dickcissel","also":["Spiza americana","Passerina caerulea"],"url":"//xeno-canto.org/103961","q":"A","time":"9:45am","file-name":"Dickcissel97.mp3"},{"date":"2013-07-14","loc":"Dordt College Prairie, Sioux, Iowa","birdId":634,"lic":"//creativecommons.org/licenses/by-sa/3.0/","type":"song","ssp":"","gen":"Spiza","rec":"Jonathon Jongsma","rmk":"Individual #5 recorded today.  Singing from forb perches in a small patch of restored tallgrass prai","file":"https://xeno-canto.org/142657/download","uploaded":"2013-07-15","playback-used":"no","id":"142657","sp":"americana","lat":"43.0802","lng":"-96.1643","bird-seen":"unknown","length":"0:13","alt":"440","sono":{"small":"//xeno-canto.org/sounds/uploaded/OJMFAOUBDU/ffts/XC142657-small.png","large":"//xeno-canto.org/sounds/uploaded/OJMFAOUBDU/ffts/XC142657-large.png","med":"//xeno-canto.org/sounds/uploaded/OJMFAOUBDU/ffts/XC142657-med.png","full":"//xeno-canto.org/sounds/uploaded/OJMFAOUBDU/ffts/XC142657-full.png"},"cnt":"United States","en":"Dickcissel","also":["Turdus migratorius"],"url":"//xeno-canto.org/142657","q":"A","file-name":"XC142657-JMJ-20130714-070002-1346-USA-IA-DordtPrairie-DICK-6.mp3","time":"07:00"},{"date":"1999-04-22","loc":"Moffett River Bottoms, OK","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-nd/4.0/","type":"song","rec":"Peter Boesman","gen":"Spiza","rmk":"ID certainty 100%. (Archiv. tape 74 side B track 24 seq. A)","ssp":"","file":"https://xeno-canto.org/229824/download","playback-used":"unknown","uploaded":"2015-03-23","id":"229824","sp":"americana","lat":"35.3904","lng":"-94.4822","bird-seen":"unknown","length":"0:20","sono":{"small":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229824-small.png","large":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229824-large.png","med":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229824-med.png","full":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229824-full.png"},"cnt":"United States","alt":"","en":"Dickcissel","also":[""],"url":"//xeno-canto.org/229824","q":"A","file-name":"XC229824-Dickcissel A 16631.mp3","time":"07:00"},{"date":"1999-04-22","loc":"Moffett River Bottoms, OK","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-nd/4.0/","type":"song","gen":"Spiza","rmk":"ID certainty 100%. (Archiv. tape 74 side B track 24 seq. B)","rec":"Peter Boesman","ssp":"","file":"https://xeno-canto.org/229825/download","playback-used":"unknown","uploaded":"2015-03-23","id":"229825","sp":"americana","lat":"35.3904","lng":"-94.4822","bird-seen":"unknown","sono":{"small":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229825-small.png","large":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229825-large.png","med":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229825-med.png","full":"//xeno-canto.org/sounds/uploaded/OOECIWCSWV/ffts/XC229825-full.png"},"alt":"","length":"0:27","cnt":"United States","en":"Dickcissel","also":[""],"url":"//xeno-canto.org/229825","q":"A","file-name":"XC229825-Dickcissel A 16632.mp3","time":"07:00"},{"date":"2015-05-15","loc":"south of Kingsville, Kleberg County, Texas","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-sa/4.0/","type":"male, song","rmk":"on fence","ssp":"","rec":"Paul Marvin","gen":"Spiza","file":"https://xeno-canto.org/306645/download","playback-used":"no","uploaded":"2016-03-11","id":"306645","sp":"americana","lat":"27.3658","lng":"-97.7442","bird-seen":"yes","sono":{"small":"//xeno-canto.org/sounds/uploaded/RFTXRYBVBX/ffts/XC306645-small.png","large":"//xeno-canto.org/sounds/uploaded/RFTXRYBVBX/ffts/XC306645-large.png","med":"//xeno-canto.org/sounds/uploaded/RFTXRYBVBX/ffts/XC306645-med.png","full":"//xeno-canto.org/sounds/uploaded/RFTXRYBVBX/ffts/XC306645-full.png"},"alt":"10","length":"0:26","cnt":"United States","en":"Dickcissel","also":[""],"url":"//xeno-canto.org/306645","q":"A","file-name":"XC306645-Dickcissel on fence -TX, Kingsville area, May 15, 2015, 1052 AM.mp3","time":"10:52"},{"date":"2018-07-23","loc":"Sheyenne National Grassland - McLeod, Richland County, North Dakota","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-sa/4.0/","type":"song","gen":"Spiza","rec":"Greg Irving","rmk":"","ssp":"","file":"https://xeno-canto.org/429263/download","uploaded":"2018-08-05","playback-used":"yes","id":"429263","sp":"americana","lat":"46.3617","lng":"-97.2698","bird-seen":"yes","cnt":"United States","length":"0:08","sono":{"small":"//xeno-canto.org/sounds/uploaded/YWRKFXUDUR/ffts/XC429263-small.png","large":"//xeno-canto.org/sounds/uploaded/YWRKFXUDUR/ffts/XC429263-large.png","med":"//xeno-canto.org/sounds/uploaded/YWRKFXUDUR/ffts/XC429263-med.png","full":"//xeno-canto.org/sounds/uploaded/YWRKFXUDUR/ffts/XC429263-full.png"},"alt":"320","en":"Dickcissel","also":[""],"url":"//xeno-canto.org/429263","q":"A","time":"12:00","file-name":"XC429263-241 Dickcissel (Spiza americana) Song JUL 1100h 330m SheyenneNG-McLeodND_GI_0812.mp3"},{"date":"2019-10-19","loc":"Huntingdon Valley, PA","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-sa/4.0/","type":"alarm call","ssp":"","gen":"Spiza","rec":"Paul Driver","rmk":"","file":"https://xeno-canto.org/503200/download","uploaded":"2019-10-20","playback-used":"no","id":"503200","sp":"americana","lat":"40.1226","lng":"-75.0635","bird-seen":"yes","alt":"50","length":"0:10","sono":{"small":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC503200-small.png","large":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC503200-large.png","med":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC503200-med.png","full":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC503200-full.png"},"cnt":"United States","en":"Dickcissel","also":[""],"url":"//xeno-canto.org/503200","q":"A","time":"09:00","file-name":"XC503200-DICKCISSEL PERT PA 9.04am 10192019.mp3"},{"date":"2021-06-17","loc":"Sax-Zim Bog, St. Louis Co., Minnesota","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-sa/4.0/","type":"song","gen":"Spiza","ssp":"","rec":"Paul Driver","rmk":"","file":"https://xeno-canto.org/658540/download","playback-used":"no","uploaded":"2021-06-23","id":"658540","sp":"americana","lat":"47.1675","lng":"-92.7162","bird-seen":"yes","alt":"400","sono":{"small":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658540-small.png","large":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658540-large.png","med":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658540-med.png","full":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658540-full.png"},"length":"0:13","cnt":"United States","en":"Dickcissel","also":[""],"url":"//xeno-canto.org/658540","q":"A","file-name":"XC658540-DICKCISSEL Sax-Zim Bog 2.27pm 06172021.mp3","time":"14:27"},{"date":"2021-06-20","loc":"Sax-Zim Bog, St. Louis Co., Minnesota","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-sa/4.0/","type":"song","ssp":"","gen":"Spiza","rec":"Paul Driver","rmk":"","file":"https://xeno-canto.org/658544/download","playback-used":"no","uploaded":"2021-06-23","id":"658544","sp":"americana","lat":"47.1675","lng":"-92.7162","bird-seen":"yes","sono":{"small":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658544-small.png","large":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658544-large.png","med":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658544-med.png","full":"//xeno-canto.org/sounds/uploaded/FSCGENVPXK/ffts/XC658544-full.png"},"alt":"400","length":"0:24","cnt":"United States","en":"Dickcissel","also":[""],"url":"//xeno-canto.org/658544","q":"A","time":"05:19","file-name":"XC658544-DICKCISSEL Sax-Zim Bog MN 05.19am 06202021.mp3"},{"date":"2021-06-30","loc":"St Vrain Rd, Boulder Cty, Colorado","birdId":634,"lic":"//creativecommons.org/licenses/by-nc-sa/4.0/","type":"adult, male, song","gen":"Spiza","rmk":"Natural vocalization from a damp medium height grassy field. Bird # 3","rec":"Sue Riffe","ssp":"","file":"https://xeno-canto.org/681958/download","uploaded":"2021-10-22","playback-used":"no","id":"681958","sp":"americana","lat":"40.1749","lng":"-105.2372","bird-seen":"yes","alt":"1600","sono":{"small":"//xeno-canto.org/sounds/uploaded/PVQOLRXXWL/ffts/XC681958-small.png","large":"//xeno-canto.org/sounds/uploaded/PVQOLRXXWL/ffts/XC681958-large.png","med":"//xeno-canto.org/sounds/uploaded/PVQOLRXXWL/ffts/XC681958-med.png","full":"//xeno-canto.org/sounds/uploaded/PVQOLRXXWL/ffts/XC681958-full.png"},"cnt":"United States","length":"0:26","en":"Dickcissel","also":["Agelaius phoeniceus","Buteo jamaicensis"],"url":"//xeno-canto.org/681958","q":"A","file-name":"XC681958-Dickcissel bird 3 in Boulder Cty CO on 6.30.21 at 17.52 for .26.mp3","time":"17:52"}],"lengthMax":"16","name":"Dickcissel","wingspanMin":"24.8","id":634,"wingspanMax":"26","family":"Passeriformes","sciName":"Spiza americana","order":"Cardinalidae","status":"Low Concern"}
  console.log(bird1)

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
        {/* <img style={{width: '90%', height: '80%'}} src={birdLoader} alt="birdRoll" /> */}
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
