import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://192.168.245.174:8020/api/',
  // baseURL: 'https://api.chinhnhan.com/api/',
  headers: {
    'Content-Type': 'application/json',
    Authorization: localStorage.getItem('adminCN')
      ? `Bearer ${localStorage.getItem('adminCN')}`
      : '',
  },
})

const axiosClient_NK = axios.create({
  baseURL: 'https://api.vitinhnguyenkim.com.vn/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIyIiwianRpIjoiYzlkZGVhODE0NTc5ZDI1ZGJhN2VkNzBkZDc0ZTI2YjYzMDQ5YWQ0ODBjMzY4YzNkZjY3ZjY5YmNlYjk0NzE5NWE5ODJhMmJjY2YyNDg5YzQiLCJpYXQiOjE3NTQ1Mjk4MDguMjk2OTYxLCJuYmYiOjE3NTQ1Mjk4MDguMjk2OTYyLCJleHAiOjE3ODYwNjU4MDguMjkzOTk4LCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.xLlqY8gFEuEQdV1DNKCZdsYHzEX6Nfv7zIGm_SRyUDUWKWPyldAR9kLiv-FW0t8CrbAom0EjgaVOp9J6dgD0__YXV93KfR2ahnR9A5I8YR53fdGrHonpPtlDTYIaw_CfUxskLs5J0W2CZ_cQkDlhl6I1u19JdXYAkPo-pHm-zKI15vVhzht_bpqf1m-UEMS74t-81eHuIbpy795yJ7V0umI6U8I0HnuEWNteELOxfOdjpANDILoDxy9yUtZ2RetqDsxcESQKm4tELCg-VfmexxVRAYoRj22VE0NcZuNf7AzQcUD8pAm3FYfFB5XaY8zcQMpkHJAISqrfm1lOdopYoN5Ox4CYkx6VamXF617jJKrdLTzvYLxNlG4R4qqmYrKHMioF_UV7cMjxx6LQHliCUl7OveGLJf5hbMYxumci0QKGeCcPKpd58shtVqhDLhN_5INqeLgqZUilxW8guI8rXhNmNVfNH7EhnYa2l7OzCBmlI9ntH4Jk_x9aAlqz8IwHNQVjIK-DXvM38Exv3oiUVqRSyjVii8uSJr77SKyhRyv7caSy0wJMTd-3ZGC_rzubAI9WDoalDndlJiQX5fmEU6CoL2kD3pne4GPFk7DWWT-tgkAH0S1gjlyTSowzimYZMU2JaqQxUwzZg8PxkAvor0Hga7k-IpmQgRujte5Nwqw`,
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminCN')
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
// const imageBaseUrl = 'https://api.chinhnhan.com/uploads/'
const mainBaseUrl = 'http://192.168.245.174:8020/uploads/'
const imageBaseUrl = 'https://media.vitinhnguyenkim.com.vn/uploads/'
const mainUrl = 'https://chinhnhan.com/'

export { axiosClient, imageBaseUrl, mainUrl, axiosClient_NK, mainBaseUrl }
