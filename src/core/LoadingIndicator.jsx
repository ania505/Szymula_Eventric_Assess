import React, { useEffect, useState } from "react";
import BirdRoller from "../icons/BirdRoller.gif";
import '../styles.css';

export function LoadingIndicator(props) {
  const { loading, children } = props;
  if (loading) {
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