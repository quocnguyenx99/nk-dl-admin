export const formatNumber = (value) => {
  if (typeof value === 'string') {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const unformatNumber = (value) => {
  return value.replace(/,/g, '')
}

export const convertStringToTimeStamp = (dateString) => {
  if (dateString == '') {
    return ''
  } else {
    const dateMoment = moment(dateString, 'ddd MMM DD YYYY HH:mm:ss GMTZ')
    return dateMoment.unix()
  }
}

export const notSeenData = () => {
  const [dataNotSeen, setDataNotSeen] = useState({})
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
