
import { normalizeRecordings } from "../BirdDetail"

const rec1 = {
    id: 1,
    birdId: 4,
    lat: "123",
    lng: "-87",
    date: null,
    file: undefined,
    fileName: null,
    url: null,
    lic: null,
    loc: null,
    rec: null,
}
const rec2 = {
    id: 2,
    birdId: 4,
    lat: undefined,
    lng: "-87",
    date: "2020-01-23",
    file: "some file",
    fileName: "some filename",
    url: "www.bird.com",
    lic: "some place",
    loc: "some loc",
    rec: "person",
}
const rec3 = {
    id: null,
    birdId: 4,
    lat: "123",
    lng: "-87",
    date: "2020-01-23",
    file: "some file",
    fileName: "some filename",
    url: "www.bird.com",
    lic: "some place",
    loc: "some loc",
    rec: "person",
}

const recordings = [
    rec1, rec2, rec3
]

describe('BirdDetail normalize data tests', () => {
    it('should filter out items which do not have required properties', () => {
        const normalized = normalizeRecordings(recordings)
        const ids = normalized.map(item => item.id)
        expect(ids).toEqual([1])
    })
    it('should set missing properties to defaults', () => {
        const normalized = normalizeRecordings(data)
        const expected = {
            id: 1,
            birdId: 4,
            lat: "123",
            lng: "-87",
            date: UNKNOWN,
            file: UNKNOWN,
            fileName: UNKNOWN,
            url: UNKNOWN,
            lic: UNKNOWN,
            loc: UNKNOWN,
            rec: UNKNOWN,
        }
        expect(normalized[0]).toEqual(expected)
    })
})