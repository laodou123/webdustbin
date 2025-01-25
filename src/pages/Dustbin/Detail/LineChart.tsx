import { memo } from 'react';
import ApexChart from 'react-apexcharts';

const LineChart = ({categories, series, colors = ['#8b5cf6', '#ec4899']}) => {
  const options = {
    chart: {
      id: 'sensor-data',
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: colors ?? ['#8b5cf6', '#ec4899'],
    stroke: {
      curve: 'smooth',
      width: 3
    },
    xaxis: {
      categories: categories || [],
      labels: {
        style: {
          colors: '#6b7280'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280'
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      floating: true,
      offsetY: -25,
      offsetX: -5
    },
    tooltip: {
      theme: 'light'
    },
    grid: {
      borderColor: '#f3f4f6'
    }
  };

  return (
    <ApexChart
      options={options as any}
      series={series}
      type="line"
      height='100%'
    />
  )
}

export default memo(LineChart);