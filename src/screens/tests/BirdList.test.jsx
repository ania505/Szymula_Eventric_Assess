
import { Status, SortBy } from "../../constants"
import { refine, getPage } from "../BirdList/BirdList"

const IMAGE = 'https://images.unsplash.com/photo-1542252223-c7f5b1142f93'

const bird1 = {
  id: 2,
  name: 'pidgey',
  images: [IMAGE],
  lengthMin: 2,
  lengthMax: 7,
  status: Status.LOW_CONCERN,
  sciName: 'pidgeon'
}
const bird2 = {
  id: 4,
  name: 'fearow',
  images: [],
  lengthMin: 22,
  lengthMax: 71,
  status: Status.RESTRICTED_RANGE,
  sciName: 'sparrow'
}
const bird3 = {
  id: 8,
  name: 'golduck',
  images: [IMAGE, IMAGE],
  lengthMin: 12,
  lengthMax: 25,
  status: Status.LOW_CONCERN,
  sciName: 'duck'
}

const data = [
    bird1, bird2, bird3
]

const filterList = Object.values(Status)

describe('BirdList refinement tests', () => {
    it('should refine data by sorting by max length', () => {
        const refined = refine(data, [], SortBy.MAX_LENGTH, filterList, false)
        const ids = refined.map(item => item.id)
        expect(ids).toEqual([4, 8, 2])
    })
    it('should refine data by sorting by min length', () => {
        const refined = refine(data, [], SortBy.MIN_LENGTH, filterList, false)
        const ids = refined.map(item => item.id)
        expect(ids).toEqual([2, 8, 4])
    })
    it('should refine data by sorting by name', () => {
        const refined = refine(data, [], SortBy.NAME, filterList, false)
        const ids = refined.map(item => item.id)
        expect(ids).toEqual([4, 8, 2])
    })
    it('should refine data by sorting by sciName', () => {
        const refined = refine(data, [], SortBy.SCI_NAME, filterList, false)
        const ids = refined.map(item => item.id)
        expect(ids).toEqual([8, 2, 4])
    })
    it('should refine data by sorting by id by default', () => {
        const refined = refine(data, [], "Invalid Sort Option", filterList, false)
        const ids = refined.map(item => item.id)
        expect(ids).toEqual([2, 4, 8])
    })

    it('should refine data by filtering status', () => {
        const refined = refine(data, [], "Invalid Sort Option", [Status.LOW_CONCERN], false)
        const ids = refined.map(item => item.id)
        expect(ids).toEqual([2, 8])
    })
    it('should refine data by returning empty if all status filters are unchecked', () => {
        const refined = refine(data, [], "Invalid Sort Option", [], false)
        const ids = refined.map(item => item.id)
        expect(ids).toEqual([])
    })
})

describe('BirdList pagination tests', () => {
    it('should paginate data across more than one page', () => {
        const page1 = getPage(data, 2, 0)
        const ids = page1.map(item => item.id)
        expect(ids).toEqual([4]) 
        const page2 = getPage(data, 2, 1)
        const ids2 = page2.map(item => item.id)
        expect(ids2).toEqual([]) 
    })
    it('should paginate data when last page has less items than items per page', () => {
        const page1 = getPage(data, 10, 0)      // Note - 10 per page here
        const ids = page1.map(item => item.id)
        expect(ids).toEqual([4, 8])
    })
})
