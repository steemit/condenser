import { assert, expect } from 'chai'

import normalizeProfile from 'app/utils/NormalizeProfile'

describe('normalizeProfile', () => {
    it('should return an empty object ', () => {
        const account = ''

        expect(normalizeProfile(account)).to.eql({})
    })

    it('should return a profile object with profile_image and cover_image', () => {
        const account = {
            json_metadata: "{\"profile\":{\"profile_image\":\"https://golos.io/profile_image.jpeg\",\"select_tags\":[],\"cover_image\":\"https://golos.io/cover_image.jpeg\"}}"
        }

        let name
        let about
        let location
        let website
        let profile_image = 'https://golos.io/profile_image.jpeg'
        let cover_image = 'https://golos.io/cover_image.jpeg'

        assert.deepEqual(normalizeProfile(account), {name, about, location, website, profile_image, cover_image})
    })

    it('should return full profile object', () => {
        const account = {
            json_metadata: "{\"profile\":{\"name\": \"lyke\", \"about\": \"some info\", \"location\": \"NY\", \"profile_image\":\"https://golos.io/profile_image.jpeg\",\"select_tags\":[],\"cover_image\":\"https://golos.io/cover_image.jpeg\", \"website\":\"https://lyke.me\"}}"
        }

        let name = 'lyke'
        let about = 'some info'
        let location = 'NY'
        let website = 'https://lyke.me'
        let profile_image = 'https://golos.io/profile_image.jpeg'
        let cover_image = 'https://golos.io/cover_image.jpeg'

        assert.deepEqual(normalizeProfile(account), {name, about, location, website, profile_image, cover_image})
    })

    it('should truncate fields', () => {
        
        const json_metadataObj = {
            profile: {
                //length 30
                name: 'qwertyuiopqwertyuiopqwertyuiop',
                //length 200
                about: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiop',
                //length 40
                location: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiop',
                //length 104
                website: 'qwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwertyuiopqwe'
            }
        }

        const np = normalizeProfile({json_metadata: JSON.stringify(json_metadataObj)})

        assert.equal(np.name.length, 22)
        assert.equal(np.about.length, 162)
        assert.equal(np.location.length, 32)
        assert.isNull(np.website)
    })

    it('check name', () => {
        const json_metadataObj = {
            profile: {
                name: '@lyke'
            }
        }

        const np = normalizeProfile({json_metadata: JSON.stringify(json_metadataObj)})
        assert.isNull(np.name)
    })

    it('check website', () => {
        const json_metadataObj = {
            profile: {
                website: 'lyke.me'
            }
        }

        const np = normalizeProfile({json_metadata: JSON.stringify(json_metadataObj)})
        assert.equal(np.website, 'http://lyke.me')
    })

    it('check profile_image and cover_image', () => {
        const json_metadataObj = {
            profile: {
                profile_image: 'lyke.me',
                cover_image: 'lyke.me'
            }
        }

        const np = normalizeProfile({json_metadata: JSON.stringify(json_metadataObj)})
        assert.isNull(np.profile_image)
        assert.isNull(np.cover_image)
    })


    it('#450 GENESIS bug', () => {
        const account = {
            name: 'lyke',
            json_metadata: "{created_at: 'GENESIS'}"
        }

        let name, about, location, website, profile_image, cover_image
        
        assert.deepEqual(normalizeProfile(account), {name, about, location, website, profile_image, cover_image})
    })
})
