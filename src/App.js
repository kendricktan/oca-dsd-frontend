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
import { BarChart } from "./barChart";
import { LineChart } from "./lineChart";

import { ethers } from "ethers";
import {
  formatCouponPurchasesStats,
  formatLpStats,
  formatDaoStats,
} from "./utils";

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
  const [couponPurchaseStats, setCouponPurchaseStats] = useState(null);
  const [couponPurchaseTreeValue, setCouponPurchaseTreeValue] = useState(null);
  const [couponPurchaseChartData, setCouponPurchaseChartData] = useState(null);
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
        const [daoData, lpData, couponPurchaseData] = await Promise.all(
          [
            "https://api-dsd.oca.wtf/data/DSD-DAO.json",
            "https://api-dsd.oca.wtf/data/DSD-LP.json",
            "https://api-dsd.oca.wtf/data/DSD-COUPONS-PURCHASED.json",
          ].map((x) => fetch(x).then((x) => x.json()))
        );

        const daoDataFormatted = formatDaoStats(daoData, epoch);

        setDaoStats(daoData);
        setDaoChartData(daoDataFormatted.bar);
        setDaoTreeValue(daoDataFormatted.tree);

        const lpDataFormatted = formatLpStats(lpData, epoch);

        setLpStats(lpData);
        setLpTreeValue(lpDataFormatted.tree);
        setLpChartData(lpDataFormatted.bar);

        const couponPurchaseDataFormatted = formatCouponPurchasesStats(
          couponPurchaseData,
          epoch
        );

        setCouponPurchaseStats(couponPurchaseData);
        setCouponPurchaseTreeValue(couponPurchaseDataFormatted.tree);
        setCouponPurchaseChartData(couponPurchaseDataFormatted.line);
      }
    };

    f();
  }, [epoch]);

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
              <BarChart data={daoChartData} />
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
              <BarChart data={lpChartData} />
              <Divider />
              <Tree value={lpTreeValue} />
            </>
          )}
        </Tabs.Item>
        <Tabs.Item label="Coupons (Purchased)" value="3">
          {!couponPurchaseTreeValue && (
            <Row style={{ padding: "50px 0" }}>
              <Loading>Loading</Loading>
            </Row>
          )}
          {couponPurchaseTreeValue && couponPurchaseChartData && (
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
                  href={`https://etherscan.io/block/${couponPurchaseStats.lastUpdateBlock}`}
                >
                  {couponPurchaseStats.lastUpdateBlock}
                </Link>
              </Note>
              <Spacer y={0.5} />
              <LineChart data={couponPurchaseChartData} />
              <Divider />
              <Tree value={couponPurchaseTreeValue} />
            </>
          )}
        </Tabs.Item>
      </Tabs>
    </Page>
  );
}

export default App;
