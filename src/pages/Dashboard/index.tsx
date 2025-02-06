import {
  Search,
  RefreshCcw,
  Sigma,
  Percent,
  ChartLine,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Chart from "react-apexcharts";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Badge, Button, Drawer, Flex, Radio, Tag } from "antd";
import { database } from "@/utils/firebase";
import { ref, onValue, query, off, limitToLast } from "firebase/database";
import { Dustbin, NotificationLog } from "./type";
import DashboardDetail from "./detail";
import NotifyLog from "./notifyLog";
import { CloseOutlined, DownloadOutlined } from "@ant-design/icons";
import { exportToCSV } from "@/utils/exportCvs";
import dayjs from "dayjs";
import { DashboardContext } from "@/context/dashboard-store";
import clsx from "clsx";

const dustbinTypes = [
  { key: "plasticStatus", name: "Plastic" },
  { key: "metalStatus", name: "Metal" },
  { key: "paperStatus", name: "Paper" },
  { key: "ewasteStatus", name: "Ewaste" },
  { key: "generalwasteStatus", name: "General Waste" },
];

const initDustbinData: Dustbin[] = [
  {
    name: "Plastic",
    fullness: 0,
    lastUpdated: "2024-01-18 13:45",
    color: "#818CF8",
    history: [],
    id: 0,
    notified: false,
  },
  {
    name: "Metal",
    fullness: 0,
    lastUpdated: "2024-01-18 13:45",
    color: "#FCD34D",
    history: [],
    id: 1,
    notified: false,
  },
  {
    name: "Paper",
    fullness: 0,
    lastUpdated: "2024-01-18 13:45",
    color: "#6EE7B7",
    history: [],
    id: 2,
    notified: false,
  },
  {
    name: "Ewaste",
    fullness: 0,
    lastUpdated: "2024-01-18 13:45",
    color: "#F472B6",
    history: [],
    id: 3,
    notified: false,
  },
  {
    name: "General Waste",
    fullness: 8,
    lastUpdated: "2024-01-18 13:45",
    color: "#93C5FD",
    history: [],
    id: 5,
    notified: false,
  },
];

const filterOptions = [
  { label: "All Dustbins", value: 0, shortLabel: "All" },
  { label: "Fullness ≥ 50%", value: 50, shortLabel: "50%" },
  { label: "Fullness ≥ 75%", value: 75, shortLabel: "75%" },
  { label: "Fullness ≥ 90%", value: 90, shortLabel: "90%" },
];

// Notification Icon Path
const NOTIFICATION_ICON = "/path/to/icon.png"; // Update this path accordingly
const FULLNESS_THRESHOLD = 90;
const COLORS = {
  high: "#FF5733",
  normal: "#36A2EB",
  empty: "#E6E6E6",
};

const chartOptions = {
  chart: {
    type: "radialBar" as const,
    animations: {
      enabled: true,
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150,
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350,
      },
    },
    background: "transparent",
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        margin: 0,
        size: "70%",
        background: "transparent",
      },
      track: {
        background: "#E5E7EB",
        strokeWidth: "97%",
        margin: 5,
        dropShadow: {
          enabled: true,
          top: 2,
          left: 0,
          blur: 4,
          opacity: 0.15,
        },
      },
      dataLabels: {
        name: {
          show: false,
        },
        value: {
          offsetY: 10,
          fontSize: "1.75rem",
          fontWeight: 600,
          formatter: function (val: number) {
            return val + "%";
          },
        },
      },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "horizontal",
      shadeIntensity: 0.5,
      gradientToColors: ["#FFF"],
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100],
    },
  },
  stroke: {
    lineCap: "round" as "round" | "butt" | "square" | undefined,
  },
};

export default function Dashboard() {
  const { searchTerm, setNoReadCount, notifyOpen, setNotifyOpen, isPc } =
    useContext(DashboardContext);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [dustbinData, setDustbinData] = useState<Dustbin[]>(initDustbinData);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  const [detail, setDetail] = useState<Dustbin | null>(null);

  const [filterFixed, setFilterFixed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
  };

  // Function to send a notification
  const sendNotification = useCallback((dustbin: Dustbin) => {
    const title = `Dustbin ${dustbin.name} is almost full!`;
    const options = {
      body: `${dustbin.name} is ${dustbin.fullness}% full. Time to empty it!`,
      icon: NOTIFICATION_ICON,
    };
    // Add to notifications log
    const newNotification: NotificationLog = {
      id: Date.now(),
      dustbinName: dustbin.name,
      message: `${dustbin.name} is ${dustbin.fullness}% full.`,
      timestamp: new Date().toLocaleString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    setNoReadCount((prev) => prev + 1);
  }, []);

  const exportNotifications = () => {
    const headers = ["Dustbin Name", "Message", "Timestamp"];
    const rows = notifications.map((notif) => [
      notif.dustbinName,
      notif.message,
      notif.timestamp,
    ]);
    exportToCSV([headers, ...rows]);
  };

  useEffect(() => {
    const listeners: (() => void)[] = [];

    dustbinTypes.forEach((type, index) => {
      const dustbinReference = ref(database, type.key);
      const dustbinQuery = query(dustbinReference, limitToLast(10));
      const listener = onValue(
        dustbinQuery,
        (snapshot) => {
          const obj = snapshot.val() || {};
          const data: any = Object.values(obj) || [];
          if (data?.length) {
            const latestData = data[data.length - 1];
            const binCapacity = latestData.binCapacity;
            const timestamp = latestData.timestamp;

            // Handle binCapacity being -1 or invalid
            const fullness =
              binCapacity >= 0 && binCapacity <= 100 ? binCapacity : 0;

            setDustbinData((prevData) => {
              const updatedData = [...prevData];
              const dustbin = { ...updatedData[index] };
              dustbin.fullness = fullness;
              dustbin.lastUpdated = timestamp;
              dustbin.notified = false;
              dustbin.history = data.map((item) => {
                const currentCapacity = item.binCapacity;
                return {
                  value: currentCapacity,
                  date: item.timestamp || dayjs().format("YYYY-MM-DD HH:mm:ss"),
                };
              });
              // dustbin.history = [
              //   ...dustbin.history.slice(-9), // Keep last 9 entries
              //   {value: fullness, date: timestamp || dayjs().format('YYYY-MM-DD HH:mm:ss')},
              // ];
              // Send notification if necessary
              if (dustbin.fullness >= FULLNESS_THRESHOLD && !dustbin.notified) {
                sendNotification(dustbin);
                dustbin.notified = true;
              }
              // Reset notified if fullness drops below threshold
              if (dustbin.fullness < FULLNESS_THRESHOLD) {
                dustbin.notified = false;
              }
              updatedData[index] = dustbin;
              return updatedData;
            });
          }
        },
        (error) => {
          console.error(`Error fetching data for ${type.name}:`, error);
        }
      );

      listeners.push(() => off(dustbinReference, "value", listener));
    });

    // Cleanup listeners on unmount
    return () => {
      listeners.forEach((unsubscribe) => unsubscribe());
    };
  }, [sendNotification]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = dustbinData.length;
    const average =
      dustbinData.reduce((acc, bin) => acc + bin.fullness, 0) / total || 0;
    return { total, average };
  }, [dustbinData]);

  const categories = useMemo(() => {
    return dustbinData.filter((bin) => {
      const matchesSearch = bin.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter = bin.fullness >= selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [dustbinData, searchTerm, selectedFilter]);

  const onScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    const upDomHeight =
      e.target.firstChild?.firstChild?.firstChild?.offsetHeight + 64;
    const toFixed = scrollTop > upDomHeight;
    setFilterFixed(toFixed);
  }, []);

  useEffect(() => {
    if (rootRef.current) {
      rootRef.current.parentElement?.addEventListener("scroll", onScroll, {
        passive: true,
      });
      return () => {
        rootRef.current?.parentElement?.removeEventListener("scroll", onScroll);
      };
    }
  }, [rootRef.current]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex-1 w-full"
      ref={rootRef}
    >
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        {/* Summary Cards */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 grid-flow-row">
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex flex-row items-center justify-between pb-2 w-full">
                <CardTitle className="text-lg font-medium text-gray-500">
                  Total Dustbins
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Sigma className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-blue-400">
                {statistics.total}
              </div>
              <p className="text-md text-gray-500 mt-1">
                Active dustbins in your network
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex flex-row items-center justify-between pb-2 w-full">
                <CardTitle className="text-lg font-medium text-gray-500">
                  Average Fullness
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Percent className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-green-400">
                {statistics.average}%
              </div>
              <p className="text-md text-gray-500 mt-1">
                Current average capacity
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dustbin Categories Filter */}
        <Flex
          className={clsx("gap-2 mb-8", {
            "absolute top-[73px] left-0 bg-white/50 p-4 z-10":
              !isPc && filterFixed,
          })}
        >
          {filterOptions.map((option) => {
            return (
              <Tag.CheckableTag
                key={option.value}
                // color={option.value === selectedFilter ? 'processing' : 'default'}
                checked={option.value === selectedFilter}
                onChange={() => handleFilterChange(option.value)}
                style={{
                  fontSize: "16px",
                  padding: "5px 15px",
                }}
              >
                {!isPc ? option.shortLabel : option.label}
              </Tag.CheckableTag>
            );
          })}
        </Flex>
        {/* Dustbin Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories
            .filter((c) => c.fullness >= selectedFilter)
            .map((oc) => {
              const category = {
                ...oc,
                color:
                  oc.fullness > FULLNESS_THRESHOLD ? COLORS.high : oc.color,
              };
              const chartOpts = {
                ...chartOptions,
                colors: [category.color],
                fill: {
                  ...chartOptions.fill,
                  gradient: {
                    ...chartOptions.fill.gradient,
                    gradientToColors: [oc.color],
                  },
                },
              };
              return (
                <Card
                  key={category.name}
                  className="overflow-hidden bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex flex-row items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${category.color}40, ${category.color}20)`,
                          }}
                        >
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <CardTitle className="text-lg font-semibold">
                          {category.name}
                        </CardTitle>
                      </div>
                      <Button
                        ghost
                        type="text"
                        className="rounded-full"
                        onClick={() => setDetail(category)}
                      >
                        <ChartLine className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-48 relative">
                        <div className="absolute inset-0 flex items-end justify-center">
                          <div className="text-sm font-medium text-gray-500">
                            Capacity
                          </div>
                        </div>
                        <Chart
                          options={chartOpts}
                          series={[category.fullness]}
                          type="radialBar"
                          height="100%"
                        />
                      </div>
                      <div className="mt-4 text-sm text-gray-500 flex items-center space-x-2">
                        <RefreshCcw className="h-4 w-4" />
                        <span>Updated: {category.lastUpdated}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {categories.length <= 0 && (
          <Alert
            message="Filter no results"
            description="No dustbins match your search and filter criteria."
            type="info"
          />
        )}

        <Drawer
          placement="right"
          open={notifyOpen}
          onClose={() => setNotifyOpen(false)}
          title="Notification Log"
          closeIcon={null}
          extra={[
            <Button
              type="text"
              key={"export"}
              onClick={exportNotifications}
              icon={<DownloadOutlined />}
            >
              Export
            </Button>,
            <Button
              type="text"
              key={"close"}
              onClick={() => setNotifyOpen(false)}
              icon={<CloseOutlined />}
            />,
          ]}
        >
          <NotifyLog notifications={notifications} />
        </Drawer>

        {!!detail && (
          <DashboardDetail
            dustbin={detail}
            open={!!detail}
            onCancel={() => setDetail(null)}
          />
        )}
      </main>
    </div>
  );
}
