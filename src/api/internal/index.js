import useBackground from './useBackground'
import apiService from '../../enums/apiService'

const defaults = {
    service: apiService.INTERNAL
}

const background = useBackground(defaults)

export {
    background
}