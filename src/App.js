/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  Page,
  Text,
  Spacer,
  Link,
  Tree,
  Tabs,
  Loading,
  Row,
  Note,
  Divider,
} from "@geist-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Text as CText,
  Label as CLabel,
} from "recharts";

import { ethers } from "ethers";
import { formatLpStats, formatDaoStats } from "./utils";

const provider = new ethers.providers.CloudflareProvider(1);

const DAO_ADDRESS = "0x6bf977ed1a09214e6209f4ea5f525261f1a2690a";
const LP_ADDRESS = "0x70A87e1b97436D2F194B8B9EBF337bFc7521C70f";

const Dao = new ethers.Contract(
  DAO_ADDRESS,
  require("./abi/DAO.json"),
  provider
);

function App() {
  const [daoStats, setDaoStats] = useState(null);
  const [daoChartData, setDaoChartData] = useState(null);
  const [daoTreeValue, setDaoTreeValue] = useState(null);
  const [lpStats, setLpStats] = useState(null);
  const [lpTreeValue, setLpTreeValue] = useState(null);
  const [lpChartData, setLpChartData] = useState(null);
  const [epoch, setEpoch] = useState(null);

  useEffect(() => {
    const f = async () => {
      if (!epoch) {
        const e = await Dao.epoch();
        setEpoch(parseInt(e.toString()));
      }

      if (epoch) {
        if (!daoStats) {
          const daoData = await fetch(
            "https://api-dsd.oca.wtf/data/DSD-DAO.json"
          ).then((x) => x.json());

          const { tree, bar } = formatDaoStats(daoData, epoch - 3);

          setDaoStats(daoData);
          setDaoChartData(bar);
          setDaoTreeValue(tree);
        }

        if (!lpStats) {
          const lpData = await fetch(
            "https://api-dsd.oca.wtf/data/DSD-LP.json"
          ).then((x) => x.json());

          const { tree, bar } = formatLpStats(lpData, epoch - 3);

          setLpStats(lpData);
          setLpTreeValue(tree);
          setLpChartData(bar);
        }
      }
    };

    f();
  }, [epoch, daoStats, lpStats]);

  return (
    <Page size="large">
      <Text h2>On Chain Activity - DSD</Text>
      <Text type="secondary">
        Made by{" "}
        <Link color href="https://twitter.com/kendricktrh">
          @kendricktrh
        </Link>
      </Text>
      <Spacer y={1} />
      <Tabs initialValue="1">
        <Tabs.Item label="DAO" value="1">
          {!daoTreeValue && (
            <Row style={{ padding: "50px 0" }}>
              <Loading>Loading</Loading>
            </Row>
          )}
          {daoTreeValue && daoChartData && (
            <>
              <Note label={false}>
                <Link
                  color
                  href={`https://etherscan.io/address/${DAO_ADDRESS}`}
                >
                  DAO Address
                </Link>
                &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp; Epoch: {epoch}
                &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;Last updated
                block:{" "}
                <Link
                  color
                  href={`https://etherscan.io/block/${daoStats.lastUpdateBlock}`}
                >
                  {daoStats.lastUpdateBlock}
                </Link>
              </Note>
              <Spacer y={0.5} />
              <div style={{ width: "95%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={daoChartData.map((x) => {
                      // eslint-disable-next-line
                      return { ...x, ["DSD Unlocked"]: x.value };
                    })}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <XAxis
                      dataKey="name"
                      label={
                        <CLabel value="LBs" position="bottom">
                          Epoch
                        </CLabel>
                      }
                    />
                    <YAxis
                      textAnchor="end"
                      tick={false}
                      label={
                        <CText
                          x={0}
                          y={0}
                          dx={50}
                          dy={200}
                          offset={0}
                          angle={-90}
                        >
                          DSD Unlocked
                        </CText>
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("en").format(value)
                      }
                    />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="DSD Unlocked" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Divider />
              <Tree value={daoTreeValue} />
            </>
          )}
        </Tabs.Item>
        <Tabs.Item label="LP" value="2">
          {!lpTreeValue && (
            <Row style={{ padding: "50px 0" }}>
              <Loading>Loading</Loading>
            </Row>
          )}
          {lpTreeValue && lpChartData && (
            <>
              <Note label={false}>
                <Link color href={`https://etherscan.io/address/${LP_ADDRESS}`}>
                  LP Address
                </Link>
                &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp; Epoch: {epoch}
                &nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;Last updated
                block:{" "}
                <Link
                  color
                  href={`https://etherscan.io/block/${lpStats.lastUpdateBlock}`}
                >
                  {lpStats.lastUpdateBlock}
                </Link>
              </Note>
              <Spacer y={0.5} />
              <div style={{ width: "95%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={lpChartData.map((x) => {
                      // eslint-disable-next-line
                      return { ...x, ["DSD Unlocked"]: x.value };
                    })}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <XAxis
                      dataKey="name"
                      label={
                        <CLabel value="LBs" position="bottom" offset={10}>
                          Epoch
                        </CLabel>
                      }
                    />
                    <YAxis
                      textAnchor="end"
                      tick={false}
                      label={
                        <CText
                          x={0}
                          y={0}
                          dx={50}
                          dy={200}
                          offset={0}
                          angle={-90}
                        >
                          DSD Unlocked
                        </CText>
                      }
                    />
                    <Tooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("en").format(value)
                      }
                    />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="DSD Unlocked" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <Divider />
              <Tree value={lpTreeValue} />
            </>
          )}
        </Tabs.Item>
      </Tabs>
    </Page>
  );
}

export default App;
