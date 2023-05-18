import React, {useState} from 'react'
import { LOCAL_STORAGE_FLOCK_KEY } from '../../../constants'
import FilledHeart3 from '../../../icons/FilledHeart3.png'
import HeartOutline from '../../../icons/HeartOutline.png'
import '../../../styles.css'

export function AddToFlock(props) {

    const [added, setAdded] = useState(false)

    const {birdId} = props;
    const id = parseInt(birdId)
    
    const handleFavoriteClick = () => {
        const likesString = localStorage.getItem(LOCAL_STORAGE_FLOCK_KEY) || "[]"
        const likesArray = JSON.parse(likesString)
        const newLikes= likesArray.includes(id) ? 
            likesArray.filter(likedId => likedId!==id) : [...likesArray, id]
        localStorage.setItem(LOCAL_STORAGE_FLOCK_KEY, JSON.stringify(newLikes))
        setAdded(!added)
    };
    
    const isFavorite = () => {
        const likesString = localStorage.getItem(LOCAL_STORAGE_FLOCK_KEY) || "[]"
        const likesArray = JSON.parse(likesString)
        return likesArray.includes(id)
    }

    return (
        <div onClick={handleFavoriteClick}>
            {isFavorite() ? "<3<3<3 Favorite Bird" : "Click to Add to Flock"}
            {/* <div className="card-heart-icon-wrapper">
              <img className="card-heart-img" src={isFavorite() ? FilledHeart3 : HeartOutline} alt="filledHeart" />
            </div> */}
        </div>
    )
    
}
