import axios from 'axios'

const axiosClient = axios.create({
  // baseURL: 'http://192.168.245.174:8020/api/',

  // api đại lý
  baseURL: 'https://api-nk.vitinhnguyenkim.vn/api/',

  headers: {
    'Content-Type': 'application/json',
    Authorization: localStorage.getItem('adminNKDL')
      ? `Bearer ${localStorage.getItem('adminNKDL')}`
      : '',
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminNKDL')
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
const imageBaseUrl = 'https://media.vitinhnguyenkim.com.vn/uploads/'
const mainUrl = 'https://vitinhnguyenkim.vn/'

export { axiosClient, imageBaseUrl, mainUrl }
