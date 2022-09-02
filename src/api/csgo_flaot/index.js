import useInspectTool from './useInspectTool'
import apiService from '@/enums/apiService'

const defaults = {
  baseUrl: 'https://api.csgofloat.com',
  service: apiService.CSGO_FLOAT
}

const inspectTool = useInspectTool(defaults)

export {
  inspectTool
}