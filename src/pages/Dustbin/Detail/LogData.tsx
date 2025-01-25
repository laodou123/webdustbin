import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';

const LogData = ({dataSource}) => {
  const generateMainContent = () => {
    if (!dataSource?.length) {
      return (
        <p>
          No messages received yet.
        </p>
      );
    }

    return dataSource.slice().reverse().map((item, idx) => {
      return (
        <span
          key={idx}
        >
          {item}
        </span>
      );
    });
  };

  return (
    <Card className="border-t-4 border-t-pink-500 shadow-lg shadow-pink-100">
      <CardHeader>
        <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">
          Message Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-sm flex flex-col">
          {generateMainContent()}
        </p>
      </CardContent>
    </Card>
  )
}

export default LogData