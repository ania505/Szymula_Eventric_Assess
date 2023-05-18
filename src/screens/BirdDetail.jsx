import React, { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
  useNavigate
} from "react-router-dom";

import { GoogleMaps } from "../core/GoogleMaps";
import { UNKNOWN, API_KEY, URL } from "../constants";
import { recordingsToBirdMock } from "../mocks/birdMocks";

import { ErrorHandler, LoadingIndicator } from "../core";
import { AddToFlock } from "./BirdList/common/AddToFlock";

import { isNil, selectRecordingsForBird } from "../utils";
import NoImageIcon from '../icons/NoImageIcon.png';
import ArrowLeft2 from '../icons/ArrowLeft2.png';
import '../styles.css'

export const BirdDetail = (props) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [selectedId, setSelectedId] = useState(0);
  
    const { recordings, setRecordings, useMocks, data } = props;
    const { id } = useParams();
  
    const recordingsForThisBird = selectRecordingsForBird(recordings, id);
    const recordingsForThisBirdExist = recordingsForThisBird.length > 0;
    const currentBird = data.filter(bird => bird.id === parseInt(id))[0];
  
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
        console.log('JSONNNN', json)
  
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

    const selectedRec = recordings.filter((rec, recId) => recId === selectedId)[0];
  
  
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
          {/* <div onClick={() => navigate('/')}>{"<"}</div>
          Bird Detail
          <>{`Name ${id}`}</>
          <AddToFlock birdId={id} /> */}
          <GoogleMaps
            locsArray={recordings}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
          />
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
          {/* {recordings.map((rec, recId) => {
            return (
              <div
                style={{ color: recId === selectedId ? "red" : "black" }}
                onClick={() => handleSelectClick(recId)}
              >
                recording#: {rec.id} location: date: {rec.date} location:{" "}
                {rec.loc}
              </div>
            );
          })} */}
        </LoadingIndicator>
      </ErrorHandler>
    );
  };

// export default BirdDetail