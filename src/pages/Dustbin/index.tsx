import { Card } from 'antd';
import { Link } from 'react-router-dom';

const bins = [
  { title: "Plastic", imageSrc: '/images/plastic.png' },
  { title: "Paper", imageSrc: '/images/paper.png' },
  { title: "Metal", imageSrc: '/images/metal.png' },
  { title: "GeneralWaste", imageSrc: '/images/generalwaste.jpg' },
  { title: "EWaste", imageSrc: '/images/ewaste.png' }
];

const Dustbin = () => {
  return (
    <div className='flex flex-col gap-4 p-2 items-center flex-1'>
      <div className='flex-1 flex flex-col max-w-6xl mx-auto'>
        <div className='py-6 px-3 flex flex-col items-center justify-center text-xl gap-4'>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Smart Dustbins
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitor and manage your waste efficiently with real-time updates.
          </p>
        </div>
        <div className='flex flex-col'>
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-6 px-2'>
            {
              bins.map((item, idx) => {
                return (
                  <Card
                    hoverable
                    classNames={{
                      body: 'p-0'
                    }}
                    bordered
                    key={idx}
                  >
                    <Link
                      className='flex flex-col overflow-hidden'
                      to={`/dustbin/${item.title}`}
                    >
                      <div className='relative rounded-md overflow-hidden border-b shadow'>
                        <img
                          src={item.imageSrc}
                          className='h-[230px] object-cover overflow-hidden w-full'
                        />
                        <span className='absolute bottom-0 left-0 right-0 bg-white bg-opacity-70 p-2 text-center font-bold'>
                          {item.title}
                        </span>
                      </div>
                      <div className='text-center p-4 text-sm text-gray-500'>
                        Click to view live updates and details about your {item.title.toLowerCase()} bin.
                      </div>
                    </Link>
                  </Card>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dustbin;
