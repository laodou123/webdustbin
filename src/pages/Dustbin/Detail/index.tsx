import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Badge, Breadcrumb, message as aMessage, Switch } from "antd";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpDown,
  Clock,
  Lock,
  MapPin,
  Scale,
  Trash2,
  Signal,
} from "lucide-react";
import HistoryData from "./HistoryData";
import LogData from "./LogData";
import { ref, onValue, onChildAdded } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import mqtt, { MqttClient } from "mqtt";
import { MQTT_OPTIONS } from "@/utils/config";
import { database } from "@/utils/firebase";

interface SensorData {
  binCapacity: number;
  cover: string;
  lock: string;
  timestamp: number; // Changed to number for consistency
  uid: string;
  upDn: string;
  weightInGrams?: string; // Optional field for weight
}

const defaultState = {
  cover: "close", // Default cover state
  position: "down", // Default position (up/down)
  lock: "lock", // Default lock state
};

const DustbinDetailPage = () => {
  const { type } = useParams();

  const clientRef = useRef<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // State for historical data
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Message log for MQTT messages
  const [messageLog, setMessageLog] = useState<string[]>([]);

  // State to hold the latest sensor data
  const [sensorData, setSensorData] = useState<SensorData | null>(null);

  const storageDataRef = useRef<any>([]);

  // State to handle loading and errors
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const binTypeLower = type ? type.toLowerCase() : "";

  const dataTopic = binTypeLower
    ? `srb/${binTypeLower}/eabc24b6-ca1c-4c94-86e1-2ebbc4952a78`
    : "";

  useEffect(() => {
    if (!binTypeLower) {
      console.warn("Bin type is not specified.");
      setError("Bin type is not specified.");
      setLoading(false);
      return;
    }

    // Construct the Firebase path based on binType
    const binStatusPath = `${binTypeLower}Status`;

    // Reference to the bin status in Firebase
    const binRef = ref(database, binStatusPath);

    // Listen for value changes
    const unsubscribe = onValue(
      binRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log(`Fetched data for ${binStatusPath}:`, data); // Detailed log

        if (data) {
          const keys = Object.keys(data);
          const latestKey = keys[keys.length - 1];
          const latestData = data[latestKey] as Partial<SensorData> & {
            command?: string;
          };

          console.log(
            `Latest data for ${binStatusPath} (Key: ${latestKey}):`,
            latestData
          ); // Detailed log

          // Check if the message is a command
          if (latestData.command) {
            console.log(
              "Received a command message. Ignoring sensor data update."
            );
            return; // Do not process command messages
          }

          // Validate and assign fields with fallbacks
          const validatedData: SensorData = {
            binCapacity:
              typeof latestData.binCapacity === "number"
                ? latestData.binCapacity
                : 0,
            cover:
              typeof latestData.cover === "string"
                ? latestData.cover
                : "unknown",
            lock:
              typeof latestData.lock === "string" ? latestData.lock : "unknown",
            timestamp:
              typeof latestData.timestamp === "number"
                ? latestData.timestamp
                : new Date().getTime(),
            uid:
              typeof latestData.uid === "string" ? latestData.uid : "unknown",
            upDn:
              typeof latestData.upDn === "string" ? latestData.upDn : "unknown",
            weightInGrams:
              typeof latestData.weightInGrams === "string"
                ? latestData.weightInGrams
                : "0",
          };

          console.log({ sensorValidateData: validatedData });
          setSensorData(validatedData);
          setLoading(false);
        } else {
          console.warn(`No data found at path: ${binStatusPath}`);
          setError(`No sensor data available for ${binStatusPath}.`);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching sensor data:", error);
        setError("Failed to fetch sensor data.");
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [binTypeLower]);

  const handleSwitchChange = (action: string) => {
    if (clientRef.current && binTypeLower) {
      const message = { command: action };
      clientRef.current.publish(dataTopic, JSON.stringify(message));
      console.log(`Published command message: ${JSON.stringify(message)}`);
    }
  };

  useEffect(() => {
    if (!binTypeLower) {
      console.warn("Bin type is not specified.");
      return;
    }

    const thrownPath = `thrown`; // Path to the thrown items
    const thrownRef = ref(database, thrownPath);

    // Listen for new thrown items
    const unsubscribe = onChildAdded(thrownRef, async (snapshot) => {
      const thrownData = snapshot.val();

      if (thrownData) {
        const { material, weightInGrams, timestamp } = thrownData;

        // Validate the presence of required fields
        if (material && weightInGrams) {
          // Check if the material matches the current binType
          if (material.toLowerCase() === binTypeLower) {
            // Update sensorData with the new weight without adjusting binCapacity
            setSensorData((prevData) => {
              if (prevData) {
                const newSensor = {
                  ...prevData,
                  weightInGrams,
                  timestamp: timestamp || Date.now(), // Update timestamp
                };
                if (storageDataRef.current.length > 50) {
                  storageDataRef.current.shift(); // Remove the oldest entry
                }
                storageDataRef.current.push(newSensor);
                return newSensor;
              }
              return prevData;
            });

            // Show a snackbar notification
            aMessage.destroy();
            aMessage.info(`Added ${weightInGrams}g to the ${material} bin.`);
          }
        } else {
          console.warn("Thrown data is missing 'material' or 'weightInGrams'.");
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [binTypeLower]);

  useEffect(() => {
    if (!dataTopic) {
      console.error("Invalid bin type");
    }

    const client = mqtt.connect(MQTT_OPTIONS as any);
    clientRef.current = client;

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      setIsConnected(true);

      // Subscribe only to the dataTopic to receive sensor data
      client.subscribe(dataTopic, (err) => {
        if (err) {
          console.error("Subscription error:", err);
          aMessage.error("Subscription error.");
        } else {
          console.log(`Subscribed to topic: ${dataTopic}`);
        }
      });
    });

    client.on("message", (receivedTopic, message) => {
      console.log("Received message:", message.toString());
      if (receivedTopic !== dataTopic) return; // Ignore messages not from dataTopic

      const receivedMessage = message.toString();
      setMessageLog((prevLog) => [...prevLog, receivedMessage]);

      try {
        const data = JSON.parse(receivedMessage) as Partial<SensorData> & {
          command?: string;
        };

        // Check if the message is a command
        if (data.command) {
          console.log(
            "Received a command message. Ignoring sensor data update."
          );
          return; // Do not process command messages
        }

        console.log("Received sensor data:", data);

        // Validate that the message contains all required SensorData fields
        if (
          typeof data.binCapacity === "number" &&
          typeof data.cover === "string" &&
          typeof data.lock === "string" &&
          typeof data.timestamp === "number" &&
          typeof data.uid === "string" &&
          typeof data.upDn === "string"
        ) {
          console.log({ sensorData: data });
          // Update sensorData without modifying timestamp unless it's genuinely new data
          setSensorData(data as SensorData);
          if (storageDataRef.current.length > 50) {
            storageDataRef.current.shift(); // Remove the oldest entry
          }
          storageDataRef.current.push(data);

          // The centralized useEffect will handle historicalData

          // Check for threshold exceedance
          const capacityThreshold = -0.5; // Example threshold
          if (data.binCapacity < capacityThreshold) {
            aMessage.warning(
              `Bin capacity below threshold: ${data.binCapacity}`
            );
          }
        } else {
          console.log("Received a non-sensor data message. Ignoring.");
        }
      } catch (error) {
        console.error("Error parsing MQTT message:", error);
      }
    });

    client.on("error", (error) => {
      console.error("MQTT Connection error:", error);
      setIsConnected(false);
      aMessage.error("MQTT connection error.");
      client.end(); // End the client on error to prevent multiple attempts
    });

    client.on("reconnect", () => {
      console.log("Reconnecting to MQTT broker...");
      aMessage.info("Reconnecting to MQTT broker...");
    });

    client.on("close", () => {
      console.log("MQTT connection closed");
      setIsConnected(false);
      messageLog.includes("MQTT connection closed.");
    });

    // Cleanup on component unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true, () => {
          console.log("MQTT client disconnected");
        });
      }
    };
  }, [dataTopic]);

  useEffect(() => {
    if (sensorData) {
      const dataArr = storageDataRef.current || [];
      setHistoricalData(dataArr);
      // setHistoricalData((prevHistorical) => {
      //   const updatedHistorical = [...prevHistorical, { ...sensorData }];

      //   // Optional: Limit the size to 50 entries
      //   if (updatedHistorical.length > 50) {
      //     updatedHistorical.shift(); // Remove the oldest entry
      //   }

      //   return updatedHistorical;
      // });

      // Check for threshold exceedance
      const capacityThreshold = -0.5; // Example threshold
      if (sensorData.binCapacity < capacityThreshold) {
        aMessage.warning(
          `Bin capacity below threshold: ${sensorData.binCapacity}`
        );
      }
    }
  }, [sensorData]);

  const generateMainContent = () => {
    if (!isConnected) {
      return (
        <div className="flex flex-1 items-center justify-center h-48 text-gray-500">
          Connecting to the MQTT broker...
        </div>
      );
    }

    return (
      <>
        <ConnectionInfoCard
          broker={MQTT_OPTIONS.host}
          dataTopic={dataTopic}
          isConnected={isConnected}
        />
        <LiveSensorDataCard
          sensorData={sensorData}
          handleChange={handleSwitchChange}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HistoryData dataSource={historicalData} />
          <LogData dataSource={messageLog} />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col p-3 flex-1 gap-2 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header>
        <Breadcrumb
          items={[
            {
              title: <Link to="/dustbin">Dustbin</Link>,
            },
            {
              title: type,
            },
          ]}
        />
      </header>
      <div className="flex-1 flex flex-col gap-4 p-2 rounded-md shadow-md overflow-y-auto">
        <Card className="space-y-2 py-4 px-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
            Plastic Bin
          </h1>
          <p className="text-gray-600">
            This is a plastic bin used for recycling plastic waste.
          </p>
        </Card>
        {generateMainContent()}
      </div>
    </div>
  );
};

const ConnectionInfoCard = ({ broker, dataTopic, isConnected }: any) => {
  return (
    <Card className="border-t-4 border-t-green-500 shadow-lg shadow-green-100">
      <CardHeader className="flex flex-col space-y-1.5 p-6">
        <div className="flex flex-col gap-1 md:gap-0 md:flex-row items-start md:items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-5 w-5 text-green-500" />
            MQTT Connection Info
          </CardTitle>
          <Badge
            status={isConnected ? "success" : "error"}
            text={isConnected ? "Connected" : "Disconnected"}
          />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-500">Broker</p>
            <p className="flex-1 text-sm font-mono break-all bg-purple-50 p-2 rounded">
              {broker}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-gray-500">Data Topic</p>
            <p className="flex-1 text-sm font-mono break-all bg-blue-50 p-2 rounded">
              {dataTopic}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LiveSensorDataCard = ({ sensorData, handleChange }: any) => {
  const [coverState, setCoverState] = useState(defaultState.cover);
  const [positionState, setPositionState] = useState(defaultState.position);
  const [lockState, setLockState] = useState(defaultState.lock);

  const resetToDefault = () => {
    setCoverState(defaultState.cover);
    setPositionState(defaultState.position);
    setLockState(defaultState.lock);
  };

  // Reset switch states after 30 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      resetToDefault();
    }, 30000); // 30 seconds

    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, [coverState, positionState, lockState]);

  return (
    <Card className="border-t-4 border-t-blue-500 shadow-lg shadow-blue-100">
      <CardHeader>
        <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-start gap-1 md:gap-0 md:flex-row md:items-center justify-between">
          <span>Live Sensor Data</span>
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <span className="text-base text-indigo-600">
              {sensorData?.timestamp
                ? new Date(sensorData.timestamp).toLocaleString()
                : "N/A"}
            </span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Cover */}
          <div className="space-y-2 bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">Cover</span>
              </div>
              <Switch
                className="data-[state=checked]:bg-orange-500"
                checked={coverState === "open"}
                onChange={(e) => {
                  const newState = e ? "open" : "close";
                  setCoverState(newState);
                  handleChange(newState);
                }}
              />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {sensorData?.cover || "N/A"}
            </p>
          </div>

          {/* Bin Capacity */}
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Bin Capacity</span>
            </div>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {sensorData?.binCapacity || "N/A"}%
            </p>
          </div>

          {/* Lock */}
          <div className="space-y-2 bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">Lock</span>
              </div>
              <Switch
                checked={lockState === "unlock"}
                onChange={(e) => {
                  const newState = e ? "unlock" : "lock";
                  setLockState(newState);
                  handleChange(newState);
                }}
              />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {sensorData?.lock || "N/A"}
            </p>
          </div>

          {/* Position */}
          <div className="space-y-2 bg-pink-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-pink-500" />
                <span className="text-sm font-medium">Position</span>
              </div>
              <Switch
                checked={positionState === "up"}
                onChange={(e) => {
                  const newState = e ? "up" : "down";
                  setPositionState(newState);
                  handleChange(newState);
                }}
              />
            </div>
            <p className="text-2xl font-bold text-pink-600">
              {sensorData?.upDn || "N/A"}
            </p>
          </div>

          {/* Weight */}
          {sensorData?.weightInGrams && (
            <div className="space-y-2 bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium">Weight</span>
              </div>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                {sensorData.weightInGrams} grams
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DustbinDetailPage;
