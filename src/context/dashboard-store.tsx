import useResponsiveObserver, { ScreenMap } from 'antd/es/_util/responsiveObserver';
import { createContext, Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

type DashboardStoreType = {
  searchTerm: string,
  setSearchTerm: Dispatch<SetStateAction<string>>,
  noReadCount: number,
  setNoReadCount: Dispatch<SetStateAction<number>>,
  notifyOpen: boolean,
  setNotifyOpen: Dispatch<SetStateAction<boolean>>,
  isPc: boolean;
}

export const DashboardContext = createContext<DashboardStoreType>({
  searchTerm: '',
  setSearchTerm: () => {},
  noReadCount: 0,
  setNoReadCount: () => {},
  notifyOpen: false,
  setNotifyOpen: () => {},
  isPc: true
});

export const DashboardProvider = ({children}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [noReadCount, setNoReadCount] = useState(0);
  const [notifyOpen, setNotifyOpen] = useState(false);
  
  const [isPc, setIsPc] = useState(true);

  const responsiveObserver = useResponsiveObserver();
  
  useEffect(() => {
    const id = responsiveObserver.subscribe((data: ScreenMap) => {
      const pc = data?.md ?? true;
      setIsPc(pc);
    });
    return () => {
      responsiveObserver.unsubscribe(id);
    }
  }, [responsiveObserver]);

  const value = useMemo(() => ({
    searchTerm, setSearchTerm, noReadCount, setNoReadCount,
    notifyOpen, setNotifyOpen, isPc
  }), [searchTerm, setSearchTerm, noReadCount, setNoReadCount, notifyOpen, setNotifyOpen, isPc]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
