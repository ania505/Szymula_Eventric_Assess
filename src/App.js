import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import { API_KEY, API_KEY_OLD, Status} from './constants'
import { birdListMock } from './mocks/BirdMocks'
import { initLocalStorage } from "./utils";
import { isNil } from "./utils";
import { UNKNOWN, URL } from "./constants";
import { BirdDetail, BirdList, NotFound } from "./screens";
import SiteTitle from './icons/SiteTitle.png';
import './styles.css';

export const cleanData = (data) => {
  const cleaned = data
    .filter((item) => {
      return !isNil(item.id) && !isNil(item.name);
    })
    .map((item) => ({
      id: item.id,
      name: item.name,
      images: item.images || [],
      lengthMin: item.lengthMin || Number.MAX_SAFE_INTEGER,
      lengthMax: item.lengthMax || Number.MIN_SAFE_INTEGER,
      status: Object.values(Status).some((stat) => stat === item.status)
        ? item.status
        : UNKNOWN,
      sciName: item.sciName || UNKNOWN
    }));
  return cleaned
}

export function App() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [useMocks, setUseMocks] = useState(false);
  
    initLocalStorage()
  
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
        const cleaned = cleanData(json)
        // throw new Error
        console.log(`Successful API call to ${URL}`);
        setData(cleaned);
        setError(false);
        setLoading(false);
      } catch (e) {
        console.log(`Error API call to ${URL}`);
        setError(true);
        setLoading(false);
      }
    };
  
    useEffect(() => {
      doFetch();
    }, [useMocks]);
  
    return (
      <Router>
        <>
        <div className="header-container">
          <div className="main-header">
            <div className="site-img-wrapper">
              <img src={SiteTitle} alt="siteTitle" />
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
          </div>
        </>
      </Router>
    );
  }

  export default App

