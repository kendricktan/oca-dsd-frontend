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
} from "@geist-ui/react";
import { ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";

const provider = new ethers.providers.CloudflareProvider(1);

const DAO_ADDRESS = "0x6bf977ed1a09214e6209f4ea5f525261f1a2690a";
const LP_ADDRESS = "0x70A87e1b97436D2F194B8B9EBF337bFc7521C70f";

const Dao = new ethers.Contract(
  DAO_ADDRESS,
  require("./abi/DAO.json"),
  provider
);

const prettyNumbers = (num) => {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
};

const prettyStr18 = (str) => {
  return prettyNumbers(
    parseFloat(ethers.utils.formatEther(ethers.BigNumber.from(str))).toFixed(2)
  );
};

const str18ToFloat = (str) => {
  return parseFloat(ethers.utils.formatEther(ethers.BigNumber.from(str)));
};

const formatDaoStats = (daoStats, epoch) => {
  const accounts = Object.keys(daoStats.accounts);

  const accountsPostEpoch = accounts
    .map((x) => {
      return { ...daoStats.accounts[x], user: x };
    })
    .map((x) => {
      return { ...x, fluidUntil: parseInt(x["fluidUntil"]) };
    })
    .filter((x) => x["fluidUntil"] > epoch);

  let epochsDataRaw = {};
  let epochsData = {};
  let treeData = [];

  for (const acc of accountsPostEpoch) {
    const { user, staged, fluidUntil } = acc;

    if (ethers.BigNumber.from(staged).gt(ethers.constants.Zero)) {
      epochsDataRaw[fluidUntil] = [...(epochsDataRaw[fluidUntil] || []), acc];

      epochsData[fluidUntil] = [
        ...(epochsData[fluidUntil] || []),
        {
          type: "file",
          name: (
            <Link color href={`https://etherscan.io/address/${user}`}>
              {user}
            </Link>
          ),
          extra: `${prettyStr18(staged)} Staged`,
          value: staged,
          valueBN: ethers.BigNumber.from(staged),
        },
      ];
    }
  }

  for (const e of Object.keys(epochsData)) {
    // Sort by value
    const curEpochDataSorted = epochsData[e].sort((a, b) =>
      a.valueBN.gt(b.valueBN) ? -1 : b.valueBN.gt(a.valueBN) ? 1 : 0
    );

    // Sum of all value
    const totalValue = curEpochDataSorted.reduce((acc, x) => {
      return acc + str18ToFloat(x.value);
    }, 0);

    // Percentage
    const curEpochDataSortedAndPercentage = curEpochDataSorted.map((x) => {
      const curVal = str18ToFloat(x.value);

      return {
        ...x,
        extra: `${prettyStr18(x.value)} DSD (${(
          (curVal / totalValue) *
          100
        ).toFixed(2)} %)`,
      };
    });

    treeData = [
      ...treeData,
      {
        type: "directory",
        name: `${e}`,
        extra: `${prettyNumbers(totalValue.toFixed(2))} DSD (${
          curEpochDataSortedAndPercentage.length
        })`,
        files: curEpochDataSortedAndPercentage,
      },
    ];
  }

  return [{ type: "directory", name: "Staged (Fluid)", files: treeData }];
};

const formatLpStats = (lpStats, epoch) => {
  const { dsdPerUniV2 } = lpStats;
  const dsdPerUniV2BN = parseEther(dsdPerUniV2);

  const accounts = Object.keys(lpStats.accounts);

  const accountsPostEpoch = accounts
    .map((x) => {
      return { ...lpStats.accounts[x], user: x };
    })
    .map((x) => {
      return { ...x, fluidUntil: parseInt(x["fluidUntil"]) };
    })
    .filter((x) => x["fluidUntil"] > epoch);

  let epochsRaw = {};
  let epochsFluid = {};
  let epochsClaimable = {};
  let treeFluid = [];
  let treeClaimable = [];

  for (const acc of accountsPostEpoch) {
    const { user, staged, claimable, fluidUntil } = acc;

    if (ethers.BigNumber.from(staged).gt(ethers.constants.Zero)) {
      epochsRaw[fluidUntil] = [...(epochsRaw[fluidUntil] || []), acc];

      // Convert from LP tokens to DSD
      const stagedFixed = dsdPerUniV2BN
        .mul(ethers.BigNumber.from(staged))
        .div(parseEther("1"));

      epochsFluid[fluidUntil] = [
        ...(epochsFluid[fluidUntil] || []),
        {
          type: "file",
          name: (
            <Link color href={`https://etherscan.io/address/${user}`}>
              {user}
            </Link>
          ),
          extra: `${prettyStr18(stagedFixed.toString())} Staged`,
          value: stagedFixed.toString(),
          valueBN: stagedFixed,
        },
      ];

      epochsClaimable[fluidUntil] = [
        ...(epochsClaimable[fluidUntil] || []),
        {
          type: "file",
          name: (
            <Link color href={`https://etherscan.io/address/${user}`}>
              {user}
            </Link>
          ),
          extra: `${prettyStr18(claimable)} Staged`,
          value: claimable,
          valueBN: ethers.BigNumber.from(claimable),
        },
      ];
    }
  }

  for (const e of Object.keys(epochsFluid)) {
    // Sort by value
    const curEpochDataSorted = epochsFluid[e].sort((a, b) =>
      a.valueBN.gt(b.valueBN) ? -1 : b.valueBN.gt(a.valueBN) ? 1 : 0
    );

    // Sum of all value
    const totalValue = curEpochDataSorted.reduce((acc, x) => {
      return acc + str18ToFloat(x.value);
    }, 0);

    // Percentage
    const curEpochDataSortedAndPercentage = curEpochDataSorted.map((x) => {
      const curVal = str18ToFloat(x.value);

      return {
        ...x,
        extra: `${prettyStr18(x.value)} DSD (${(
          (curVal / totalValue) *
          100
        ).toFixed(2)} %)`,
      };
    });

    treeFluid = [
      ...treeFluid,
      {
        type: "directory",
        name: `${e}`,
        extra: `${prettyNumbers(totalValue.toFixed(2))} DSD (${
          curEpochDataSortedAndPercentage.length
        })`,
        files: curEpochDataSortedAndPercentage,
      },
    ];
  }

  for (const e of Object.keys(epochsClaimable)) {
    // Sort by value
    const curEpochDataSorted = epochsClaimable[e].sort((a, b) =>
      a.valueBN.gt(b.valueBN) ? -1 : b.valueBN.gt(a.valueBN) ? 1 : 0
    );

    // Sum of all value
    const totalValue = curEpochDataSorted.reduce((acc, x) => {
      return acc + str18ToFloat(x.value);
    }, 0);

    // Percentage
    const curEpochDataSortedAndPercentage = curEpochDataSorted.map((x) => {
      const curVal = str18ToFloat(x.value);

      return {
        ...x,
        extra: `${prettyStr18(x.value)} DSD (${(
          (curVal / totalValue) *
          100
        ).toFixed(2)} %)`,
      };
    });

    treeClaimable = [
      ...treeClaimable,
      {
        type: "directory",
        name: `${e}`,
        extra: `${prettyNumbers(totalValue.toFixed(2))} DSD (${
          curEpochDataSortedAndPercentage.length
        })`,
        files: curEpochDataSortedAndPercentage,
      },
    ];
  }

  return [
    { type: "directory", name: "Staged (Fluid)", files: treeFluid },
    { type: "directory", name: "Staged (Claimable)", files: treeClaimable },
  ];
};

function App() {
  const [daoStats, setDaoStats] = useState(null);
  const [daoTreeValue, setDaoTreeValue] = useState(null);
  const [lpStats, setLpStats] = useState(null);
  const [lpTreeValue, setLpTreeValue] = useState(null);
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

          const daoTreeDataFormatted = formatDaoStats(daoData, epoch);

          setDaoStats(daoData);
          setDaoTreeValue(daoTreeDataFormatted);
        }

        if (!lpStats) {
          const lpData = await fetch(
            "https://api-dsd.oca.wtf/data/DSD-LP.json"
          ).then((x) => x.json());

          const lpTreeDataFormatted = formatLpStats(lpData, epoch);

          setLpStats(lpData);
          setLpTreeValue(lpTreeDataFormatted);
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
          {daoTreeValue && (
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
          {lpTreeValue && (
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
              <Tree value={lpTreeValue} />
            </>
          )}
        </Tabs.Item>
      </Tabs>
    </Page>
  );
}

export default App;