
import ArrowLeft2 from "../icons/ArrowLeft2.png";
import ArrowRight2 from "../icons/ArrowRight2.png";
import '../styles.css';

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