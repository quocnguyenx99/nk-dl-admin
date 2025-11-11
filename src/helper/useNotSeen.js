import { useState, useEffect } from 'react'
import { axiosClient } from '../axiosConfig'

export const useNotSeenData = () => {
  const [dataNotSeen, setDataNotSeen] = useState(null)

  useEffect(() => {
    const fetchNotSeenData = async () => {
      try {
        const response = await axiosClient.get('/admin/no-approved-statistics')

        if (response.data.status === true) {
          setDataNotSeen(response.data)
        }
      } catch (error) {
        console.error('Fetch data not seen is error', error)
      }
    }

    fetchNotSeenData()
  }, [])

  return dataNotSeen
}
