import React, { useEffect, useState } from "react";
import { SortBy, Status } from "../../constants";

import { getMyFlock } from "../../utils";
import { ErrorHandler, LoadingIndicator, RefinementHeader, PaginationFooter } from "../../core";
import { BirdCard } from "./components/BirdCard";
import BirdIcon from '../../icons/BirdIcon.png';
import FilledHeart3 from '../../icons/FilledHeart3.png';
import '../../styles.css';

const ITEMS_PER_PAGE = 10;

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

export const refine = (data, likesList, sortBy, filterList, showFavorites) => {
  const sortFunc = getSortByFunc(sortBy);
  const filterFunc = (bird) =>
    filterList.some((status) => bird.status === status);

  const res = data
    .filter(filterFunc)
    .filter((bird) => {
      return showFavorites
        ? likesList.some((likedId) => likedId === bird.id)
        : true;
    })
    .sort((bird1, bird2) => {
      if(sortBy === SortBy.MIN_LENGTH){
        return parseInt(sortFunc(bird1)) >= parseInt(sortFunc(bird2)) ? 1 : -1;
      } else if(sortBy === SortBy.MAX_LENGTH){
        return parseInt(sortFunc(bird1)) >= parseInt(sortFunc(bird2)) ? -1 : 1;
      }else {
        return sortFunc(bird1) >= sortFunc(bird2) ? 1 : -1;
      }
    });

  return res;
}

export const getPage = (birdsRefined, itemsPerPage, page) => {
  const birdsPage = birdsRefined.filter((item, idx) => {
    const pageStart = itemsPerPage * page;
    const pageEnd = pageStart + itemsPerPage;
    return idx > pageStart && idx < pageEnd;
  });
  return birdsPage
}

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

    const likesList = getMyFlock();

    const birdsRefined = refine(data, likesList, sortBy, filterList, showFavorites)
    const birdsPage = getPage(birdsRefined, itemsPerPage, page)
    const lastPage = birdsRefined.length / itemsPerPage;
    
    return (
      <ErrorHandler error={error} handleReload={handleReload}>
        <LoadingIndicator loading={loading}>
          <div className="refine-and-flock">
            <RefinementHeader
              data={data}
              handleSubmit={handleSubmit}
              sortBy={sortBy}
              sortValues={Object.values(SortBy)}
              filterList={filterList}
              filterValues={Object.values(Status)}
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
            <BirdCard
              bird={bird}
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