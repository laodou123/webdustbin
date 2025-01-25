import { Alert, Flex } from 'antd';
import { NotificationLog } from './type';

type NotifyLogProps = {
  notifications: NotificationLog[];
}

const NotifyLog = ({ notifications }: NotifyLogProps) => {
  return (
    <Flex vertical>
      {notifications.length > 0 && (<ul className="list-none">
        {notifications.map((notification) => (
          <li key={notification.id} className='flex flex-col gap-2 list-none border-gray-200 border rounded-md p-4 mb-2'>
            <p className='text-lg'>
              <span className='font-bold mr-2'>{notification.dustbinName}:</span>
              <span>{notification.message}</span>
            </p>
            <span className='text-sm text-right'>{notification.timestamp}</span>
          </li>
        ))}
      </ul>)}

      {notifications.length <= 0 && (
          <Alert
            description="No notifications sent."
            type="info"
          />
        )}
    </Flex>
  );
}

export default NotifyLog;
