import { Flex, Modal } from 'antd';
import { Dustbin } from './type';
import LineChart from '../Dustbin/Detail/LineChart';
import { useContext } from 'react';
import { DashboardContext } from '@/context/dashboard-store';

type DashboardDetailProps = {
  dustbin: Dustbin;
  open: boolean;
  onCancel: () => void;
}

const DashboardDetail = ({dustbin, open, onCancel}: DashboardDetailProps) => {
  const { isPc } = useContext(DashboardContext);
  return (
    <Modal
      title={`${dustbin.name} Detail`}
      open={open}
      onCancel={onCancel}
      destroyOnClose
      footer={null}
      width={'600px'}
      style={{top: 'calc(50% - 300px)', left: isPc ? '100px' : undefined}}
    >
      <Flex justify='space-between' className='mt-4 mb-0'>
        <p className='flex items-center'>
          <span>Fullness:</span>
          <span className='font-bold text-lg ml-2' style={{color: dustbin.color}}>{dustbin.fullness}</span>
        </p>
        <p className='flex items-center'>
          <span>Last Updated:</span>
          <span className='ml-2'>{dustbin.lastUpdated}</span>
        </p>
      </Flex>
      <div style={{height: '300px'}}>
        <LineChart
          categories={(dustbin.history || []).map(item => item.date)}
          series={[{ name: 'Fullness', data: dustbin.history.map(item => item.value) }]}
          colors={[dustbin.color]}
        />
      </div>
    </Modal>
  );
}

export default DashboardDetail;
