import React, { useEffect, useRef } from 'react'

import { CChart, CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const data = {
  Tuần: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Khách mua hàng',
        data: [12, 19, 3, 5, 2, 3, 7],
        backgroundColor: 'rgba(60, 141, 188, 0.2)',
        borderColor: '#3c8dbc',
        pointBackgroundColor: '#3c8dbc',
        pointBorderColor: '#fff',
      },
      {
        label: 'Lượt truy cập',
        data: [7, 11, 5, 8, 3, 7, 4],
        backgroundColor: 'rgba(247, 114, 37, 0.2)',
        borderColor: '#f77225',
        pointBackgroundColor: '#f77225',
        pointBorderColor: '#fff',
      },
    ],
  },
  Tháng: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Khách mua hàng',
        data: [40, 30, 60, 80],
        backgroundColor: 'rgba(60, 141, 188, 0.2)',
        borderColor: '#3c8dbc',
        pointBackgroundColor: '#3c8dbc',
        pointBorderColor: '#fff',
      },
      {
        label: 'Lượt truy cập',
        data: [60, 45, 70, 90],
        backgroundColor: 'rgba(247, 114, 37, 0.2)',
        borderColor: '#f77225',
        pointBackgroundColor: '#f77225',
        pointBorderColor: '#fff',
      },
    ],
  },
  Năm: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Khách mua hàng',
        data: [40, 20, 12, 39, 10, 40, 39],
        backgroundColor: 'rgba(60, 141, 188, 0.2)',
        borderColor: '#3c8dbc',
        pointBackgroundColor: '#3c8dbc',
        pointBorderColor: '#fff',
      },
      {
        label: 'Lượt truy cập',
        data: [50, 12, 28, 29, 7, 25, 12],
        backgroundColor: 'rgba(247, 114, 37, 0.2)',
        borderColor: '#f77225',
        pointBackgroundColor: '#f77225',
        pointBorderColor: '#fff',
      },
    ],
  },
}

const MainChart = ({ timePeriod }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  const random = () => Math.round(Math.random() * 100)

  return (
    <>
      <CChart
        type="line"
        data={data[timePeriod]}
        options={{
          plugins: {
            legend: {
              labels: {
                color: getStyle('--cui-body-color'),
              },
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
