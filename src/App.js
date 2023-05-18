import React, { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { API_KEY, API_KEY_OLD, Status} from './constants'
import { birdListMock, recordingsToBirdMock } from './mocks/birdMocks'
import { initLocalStorage } from "./utils";
import { isNil } from "./utils";
import { UNKNOWN, URL } from "./constants";
import { BirdDetail, BirdList, NotFound } from "./screens";
import SiteTitle2 from './icons/SiteTitle2.png';
import './styles.css';

export function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [useMocks, setUseMocks] = useState(false);
    // const [showFavorites, setShowFavorites] = useState(showFavoritesDefault);
  
    initLocalStorage()
  
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
        console.log("DATA", cleaned)
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
        <div className="header-container">
          <div className="main-header">
            <div className="site-img-wrapper">
              <img src={SiteTitle2} alt="siteTitle" />
            </div>
          </div>
        </div>
          <div style={{backgroundColor: '#B6EBAD'}}>
            <Routes>
              <Route
                path="/"
                element={
                  <BirdList
                    doFetch={doFetch}
                    //showFavorites={showFavorites}
                    //setShowFavorites
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
                    // showFavorites={showFavorites}
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
          </div>
        </>
      </Router>
    );
  }

  export default App

