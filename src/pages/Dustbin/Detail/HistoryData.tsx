import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';
import { Clock } from 'lucide-react';
import LineChart from './LineChart';
import { useMemo } from 'react';

const HistoryData = ({dataSource}: any) => {
  const formattedData = useMemo(() => {
    return (dataSource || []).reduce((acc: any, current: any) => {
      const {timestamp, binCapacity, weightInGrams} = current || {};
      acc.categories.push(new Date(timestamp || Date.now()).toLocaleTimeString());
      acc.binCapacity.push(binCapacity);
      acc.weightInGrams.push(weightInGrams);
      return acc;
    }, {categories: [], binCapacity: [], weightInGrams: []});
  }, [dataSource]);

  const series = [
    {
      name: 'Bin Capacity',
      data: formattedData?.binCapacity || []
    },
    {
      name: 'Weight in Grams',
      data: formattedData?.weightInGrams || []
    }
  ];

  return (
    <Card className="border-t-4 border-t-purple-500 shadow-lg shadow-purple-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          <Clock className="h-5 w-5 text-purple-500" />
          Historical Sensor Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <div className='flex flex-col h-full'>
            <LineChart
              categories={formattedData.categories}
              series={series}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default HistoryData;