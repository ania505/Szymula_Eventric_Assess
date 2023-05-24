import React, { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import Filter2 from '../icons/Filter2.png';
import xIcon3 from '../icons/xIcon3.png';
import '../styles.css';

export function RefinementHeader(props) {
  const { handleSubmit, sortBy, sortValues, filterList, filterValues} = props;

  const [sortLocal, setSortLocal] = useState(props.sortBy);
  const [filterLocal, setFilterLocal] = useState(props.filterList);

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
                  {sortValues.map((sortType) => {
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
                  {filterValues.map((stat) => {
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
