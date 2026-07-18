import axios from 'axios'

const axiosClient = axios.create({
  // baseURL: 'http://192.168.245.174:8020/api/',

  // api đại lý
  baseURL: 'https://api-nk.vitinhnguyenkim.vn/api/',

  headers: {
    'Content-Type': 'application/json',
    Authorization: localStorage.getItem('adminNKCP')
      ? `Bearer ${localStorage.getItem('adminNKCP')}`
      : '',
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminNKCP')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Configuration for images
const imageBaseUrl = 'https://media.vitinhnguyenkim.vn/uploads/'
const mainUrl = 'https://vitinhnguyenkim.vn/'

export { axiosClient, imageBaseUrl, mainUrl }
