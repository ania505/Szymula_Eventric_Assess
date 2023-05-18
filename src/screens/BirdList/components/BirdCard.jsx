import React from "react";
import { useNavigate } from "react-router-dom";
import NoImageIcon from "../../../icons/NoImageIcon.png";
import { AddToFlock } from "../common/AddToFlock";
import '../../../styles.css'

export function BirdCard(props) {
  const { bird } = props;
  const { id, name, sciName, lengthMin, lengthMax, status, images } = bird;
  const hasImages = !!images && images.length > 0;
  const navigate = useNavigate();

  return (
    <>
      <div className="card-container">
          <div className="bird-card-img-wrapper" onClick={() => navigate(`/birds/${id}`)}>
            <img
              className="bird-card-img"
              src={hasImages ? images[0] : NoImageIcon}
              alt={`${name}Bird`}
            />
          </div>
        <div className="info-and-fav">
          <div className="info-text" onClick={() => navigate(`/birds/${id}`)}>
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