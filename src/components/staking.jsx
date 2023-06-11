import {
  Button,
  Container,
  InputBase,
  useMediaQuery,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Grid,
} from "@mui/material";
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  useStakingContract,
  useTokenContract,
} from "../ConnectivityAssets/hooks";

import { formatUnits, parseUnits } from "@ethersproject/units";
import { AppContext } from "../utils";
import Loading from "../loading";
import { stakingAddress } from "../ConnectivityAssets/environment";
import UnstakeModal from "./UnstakeModal";

function Staking() {
  const matches = useMediaQuery("(max-width:700px)");
  const matchesPlan = useMediaQuery("(max-width:486px)");

  const { account, signer, connect } = useContext(AppContext);

  const stakingContract = useStakingContract(signer);
  const tokenContract = useTokenContract(signer);

  const [amount, setamount] = useState("");
  const [loading, setloading] = useState(false);
  const [planIndex, setplanIndex] = useState(0);
  const [currentStaked, setcurrentStaked] = useState(0);
  const [bonus, setbonus] = useState(0);
  const [stakeDetails, setstakeDetails] = useState([]);
  const [balance, setbalance] = useState(0);
  const [TotalStakers, setTotalStakers] = useState(0);
  const [totalStaked, settotalStaked] = useState(0);
  const [totalUnStaked, settotalUnStaked] = useState(0);
  const [totalWithDrawn, settotalWithDrawn] = useState(0);
  const [unstakeModal, setunstakeModal] = useState(false);
  const [unstakeIndex, setunstakeIndex] = useState("");

  const initInfo = async () => {
    try {
      const totalStakers = await stakingContract.totalStakers();
      const totalWithdrawan = await stakingContract.totalWithdrawanToken();
      const totalStakedAmount = await stakingContract.totalStakedToken();
      const totalUnStakedAmount = await stakingContract.totalUnStakedToken();
      setTotalStakers(+totalStakers);
      settotalStaked(formatUnits(totalStakedAmount.toString(), 18));
      settotalWithDrawn(formatUnits(totalWithdrawan.toString(), 18));
      settotalUnStaked(formatUnits(totalUnStakedAmount.toString(), 18));
    } catch (error) {
      console.log(error, "error");
    }
  };
  useEffect(() => {
    initInfo();
  }, []);

  const init = async () => {
    try {
      const { stakeCount } = await stakingContract.Stakers(account);
      const balance = await tokenContract.balanceOf(account);
      setbalance(formatUnits(balance.toString(), 18));
      if (+stakeCount > 0) {
        let arr = [];
        let currentstaked = 0;
        for (let i = 0; i < +stakeCount; i++) {
          setloading(true);
          const {
            amount,
            reward,
            withdrawan,
            unstaked,
            staketime,
            withdrawtime,
          } = await stakingContract.stakersRecord(account, i.toString());
          const obj = {
            time: +withdrawtime,
            amount: +formatUnits(amount.toString(), 18),
            reward: +formatUnits(reward.toString(), 18),
            withdrawan: withdrawan,
            unstaked: unstaked,
          };
          if (!unstaked && !withdrawan) {
            currentstaked += +formatUnits(amount.toString(), 18);
          }
          arr.push(obj);
        }
        setcurrentStaked(currentstaked);
        setstakeDetails([...arr]);
        setloading(false);
      }
      setloading(false);
    } catch (error) {
      console.log(error);
      setloading(false);
    }
  };
  useEffect(() => {
    if (account) {
      init();
    }
  }, [account]);

  const stakeHandler = async () => {
    if (!account) {
      toast.error("Error! Please connect your wallet.");
    } else if (!amount) {
      toast.error("Error! Please enter amount.");
    } else {
      try {
        setloading(true);
        const tx = await tokenContract.approve(
          stakingAddress,
          parseUnits(amount, 18)
        );
        await tx.wait();
        const tx1 = await stakingContract.stake(
          parseUnits(amount, 18),
          planIndex.toString()
        );
        await tx1.wait();
        toast.success("Success! Transaction Confirmed.");
        init();
        setloading(false);
        init();
      } catch (err) {
        if (err?.data?.message) {
          toast.error(err?.data?.message);
        } else {
          toast.error(err?.message);
        }
        setloading(false);
      }
    }
  };
  useEffect(() => {
    const init = async () => {
      try {
        const percent = await stakingContract.percentDivider();
        const bonus = await stakingContract.Bonus(planIndex.toString());
        let bonusToken = (+bonus / +percent) * +amount;
        setbonus(+amount + bonusToken);
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, [amount, planIndex]);

  const claimHandler = async (index) => {
    try {
      setloading(true);
      const tx = await stakingContract.withdraw(index.toString());
      await tx.wait();
      toast.success("Success! Amount successfully claimed.");
      init();
      setloading(false);
    } catch (error) {
      if (error?.data?.message) {
        toast.error(error?.data?.message);
      } else {
        toast.error(error?.message);
      }
      setloading(false);
    }
  };

  return (
    <>
      <Box py={10} position="relative" zIndex={1}>
        <Loading loading={loading} />
        <UnstakeModal
          open={unstakeModal}
          setOpen={setunstakeModal}
          unstakeIndex={unstakeIndex}
        />
        <Container maxWidth="xl">
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Box
                  p={2}
                  width={matches ? "300px" : "500px"}
                  bgcolor="#02a701"
                  border="7px solid #193158"
                  style={{
                    fontSize: matches ? "20px" : "30px",
                    fontFamily: "Regular",
                    fontWeight: "900",
                    color: "#ffffff",
                    textAlign: "center",
                    letterSpacing: "5px",
                    borderRadius: "20px",
                  }}
                >
                  Staking Dashboard
                </Box>
              </Box>
              <Box
                border="10px solid #193158"
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
                zIndex="10"
                px={matches ? 2 : 3}
                pt={2}
                pb={5}
                mt={-5}
                className="shadow"
                borderRadius="20px"
              >
                <Box
                  display="flex"
                  alignItems="center"
                  mt={6}
                  mb={1}
                  boxShadow="#193158 0px 0px 5px 3px"
                  style={{
                    borderRadius: "10px",
                  }}
                  width="100%"
                  pb={1}
                >
                  <InputBase
                    style={{
                      color: "#ffffff",
                      fontFamily: "Nunito",
                      fontWeight: 400,
                      fontSize: 17,
                      marginTop: 10,
                      width: "100%",
                      paddingRight: "15px",
                      backgroundColor: "transparent",
                      paddingLeft: "15px",
                    }}
                    fullWidth
                    type="number"
                    id="standard-basic"
                    variant="standard"
                    placeholder="Enter Stake Amount"
                    value={amount}
                    onChange={(e) => setamount(e.target.value)}
                  />
                  <Box
                    fontFamily="Nunito"
                    fontWeight="700"
                    fontSize="20px"
                    zIndex={2}
                    mr={2}
                    pt={1}
                    style={{
                      cursor: "pointer",
                      color: "#ffffff",
                      textAlign: "center",
                      letterSpacing: "5px",
                      textTransform: "uppercase",
                    }}
                    onClick={() => setamount(balance)}
                  >
                    Max
                  </Box>
                </Box>
                <Box alignSelf="center" mt={1}>
                  <i
                    style={{ color: "#ffffff", fontSize: "20px" }}
                    className="far fa-plus"
                  ></i>
                </Box>
                <Box
                  mt={1}
                  py={2}
                  px={1}
                  display="flex"
                  flexDirection="column"
                  boxShadow="#193158 0px 0px 5px 3px"
                  style={{
                    borderRadius: "10px",
                  }}
                >
                  <Box
                    alignSelf="center"
                    fontSize="18px"
                    fontFamily="Nunito"
                    color="#ffffff"
                    mb={1}
                    boxShadow="#193158 0px 0px 5px 3px"
                    borderRadius="10px"
                    p={2}
                  >
                    Lock Tokens For
                  </Box>

                  <Box
                    display="flex"
                    justifyContent={matchesPlan ? "center" : "space-between"}
                    alignItems="center"
                    flexWrap="wrap"
                    mt={3}
                  >
                    <Button
                      style={{
                        background: "#02a701",
                        border: "2px solid #ffffff",
                        fontSize: matches ? "10px" : "15px",
                        borderRadius: "50px",
                        width: matches ? "27%" : "30%",
                        height: matches ? "25px" : "40px",
                        color: "#ffffff",
                        textTransform: "capitalize",
                        fontWeight: "500",
                        fontFamily: "Nunito",
                        marginRight: matchesPlan ? "10px" : "0px",
                      }}
                      onClick={() => setplanIndex(0)}
                    >
                      7 Days
                    </Button>
                    <Button
                      style={{
                        background: "#02a701",
                        border: "2px solid #ffffff",
                        fontSize: matches ? "10px" : "15px",
                        borderRadius: "50px",
                        width: matches ? "27%" : "30%",
                        height: matches ? "25px" : "40px",
                        color: "#ffffff",
                        textTransform: "capitalize",
                        fontWeight: "500",
                        fontFamily: "Nunito",
                        marginRight: matchesPlan ? "10px" : "0px",
                      }}
                      onClick={() => setplanIndex(1)}
                    >
                      21 Days
                    </Button>
                    <Button
                      style={{
                        background: "#02a701",
                        border: "2px solid #ffffff",
                        fontSize: matches ? "10px" : "15px",
                        borderRadius: "50px",
                        width: matches ? "27%" : "30%",
                        height: matches ? "25px" : "40px",
                        color: "#ffffff",
                        textTransform: "capitalize",
                        fontWeight: "500",
                        fontFamily: "Nunito",
                        marginRight: matchesPlan ? "10px" : "0px",
                      }}
                      onClick={() => setplanIndex(2)}
                    >
                      60 Days
                    </Button>
                  </Box>
                </Box>
                <Box alignSelf="center" mt={2}>
                  <i
                    style={{ color: "#ffffff", fontSize: "22px" }}
                    className="far fa-arrow-down"
                  ></i>
                </Box>
                <Box
                  my={2}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  boxShadow="#193158 0px 0px 5px 3px"
                  style={{
                    borderRadius: "10px",
                  }}
                  width="100%"
                  pb={1}
                >
                  <InputBase
                    style={{
                      color: "#ffffff",
                      fontFamily: "Nunito",
                      fontWeight: 400,
                      fontSize: 17,
                      marginTop: 10,
                      width: "100%",
                      paddingRight: "15px",
                      backgroundColor: "transparent",
                      paddingLeft: "15px",
                    }}
                    readOnly
                    fullWidth
                    type="text"
                    id="standard-basic"
                    variant="standard"
                    placeholder="0"
                    value={bonus}
                  />
                  <Box
                    fontFamily="Nunito"
                    fontWeight="700"
                    fontSize="20px"
                    mr={2}
                    pt={1}
                    style={{
                      cursor: "pointer",
                      color: "#ffffff",
                      textAlign: "center",
                      letterSpacing: "5px",
                      textTransform: "uppercase",
                    }}
                  >
                    $WOBY
                  </Box>
                </Box>

                <Box
                  mt={5}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  {account ? (
                    <Box
                      style={{
                        cursor: "pointer",
                      }}
                      width="130px"
                      height="42px"
                      bgcolor="#02a701"
                      border="2px solid #ffffff"
                      borderRadius="50px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      color="#ffffff"
                      fontWeight="600"
                      fontSize="18px"
                      fontFamily="Nunito"
                      onClick={() => stakeHandler()}
                    >
                      Stake
                    </Box>
                  ) : (
                    <Box
                      style={{
                        cursor: "pointer",
                      }}
                      width="130px"
                      height="42px"
                      bgcolor="#02a701"
                      border="2px solid #ffffff"
                      borderRadius="50px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      color="#ffffff"
                      fontWeight="600"
                      fontSize="18px"
                      fontFamily="Nunito"
                      onClick={() => connect()}
                    >
                      Connect
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Box
                  p={2}
                  width={matches ? "300px" : "500px"}
                  bgcolor="#02a701"
                  border="7px solid #193158"
                  style={{
                    fontSize: matches ? "20px" : "30px",
                    fontFamily: "Regular",
                    fontWeight: "900",
                    color: "#ffffff",
                    textAlign: "center",
                    letterSpacing: "5px",
                    borderRadius: "20px",
                  }}
                >
                  Statistics
                </Box>
              </Box>
              <Box
                border="10px solid #193158"
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
                filter="blur(52px)"
                zIndex="10"
                px={matches ? 2 : 3}
                pt={2}
                pb={5}
                mt={-5}
                className="shadow"
                borderRadius="20px"
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  px={2}
                  py={2}
                  mt={3}
                  style={{
                    borderRadius: "10px",
                  }}
                >
                  <Box
                    width="100%"
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                    boxShadow="#193158 0px 0px 5px 3px"
                    borderRadius="10px"
                    px={2}
                    mt={1}
                    py={1.4}
                    mr={matches ? 0 : 1}
                  >
                    <Typography
                      fontWeight="700"
                      fontSize="13px"
                      display="flex"
                      alignItems="center"
                      textTransform="uppercase"
                      color="#DFDFDF"
                      fontFamily="Nunito"
                      marginTop="15px"
                    >
                      Total Stakers
                    </Typography>

                    <Typography
                      fontWeight="600"
                      fontSize={{ xs: "17px", md: "26px" }}
                      lineHeight="150%"
                      display="flex"
                      alignItems="center"
                      color="#ffffff"
                      fontFamily="Nunito"
                    >
                      {TotalStakers}
                    </Typography>
                  </Box>
                  <Box
                    boxShadow="#193158 0px 0px 5px 3px"
                    borderRadius="10px"
                    mt={3}
                    width="100%"
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                    px={2}
                    py={1.4}
                  >
                    <Typography
                      fontWeight="700"
                      fontSize="13px"
                      display="flex"
                      alignItems="center"
                      textTransform="uppercase"
                      color="#DFDFDF"
                      fontFamily="Nunito"
                      marginTop="15px"
                    >
                      Total Staked
                    </Typography>

                    <Typography
                      fontWeight="600"
                      fontSize={{ xs: "17px", md: "26px" }}
                      lineHeight="150%"
                      display="flex"
                      alignItems="center"
                      color="#ffffff"
                      fontFamily="Nunito"
                    >
                      {parseFloat(totalStaked).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box
                    width="100%"
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                    boxShadow="#193158 0px 0px 5px 3px"
                    borderRadius="10px"
                    mt={3}
                    px={2}
                    py={1.4}
                  >
                    <Typography
                      fontWeight="700"
                      fontSize="13px"
                      display="flex"
                      alignItems="center"
                      textTransform="uppercase"
                      color="#DFDFDF"
                      fontFamily="Nunito"
                      marginTop="15px"
                    >
                      Total Withdrawn
                    </Typography>

                    <Typography
                      fontWeight="600"
                      fontSize={{ xs: "17px", md: "26px" }}
                      lineHeight="150%"
                      display="flex"
                      alignItems="center"
                      color="#ffffff"
                      fontFamily="Nunito"
                    >
                      {parseFloat(totalWithDrawn).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    boxShadow="#193158 0px 0px 5px 3px"
                    borderRadius="10px"
                    mt={3}
                    width="100%"
                    display="flex"
                    alignItems="center"
                    flexDirection="column"
                    px={2}
                    py={1.3}
                  >
                    <Typography
                      fontWeight="700"
                      fontSize="13px"
                      display="flex"
                      alignItems="center"
                      textTransform="uppercase"
                      color="#DFDFDF"
                      fontFamily="Nunito"
                      marginTop="15px"
                    >
                      Total Unstaked
                    </Typography>

                    <Typography
                      fontWeight="600"
                      fontSize={{ xs: "17px", md: "26px" }}
                      lineHeight="150%"
                      display="flex"
                      alignItems="center"
                      color="#ffffff"
                      fontFamily="Nunito"
                    >
                      {parseFloat(totalUnStaked).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
        <Container maxWidth="xl">
          <Box
            mt={10}
            display="flex"
            alignItems="center"
            flexDirection="column"
          >
            <Box
              bgcolor="#02a701"
              p={2}
              width={matches ? "300px" : "500px"}
              border="7px solid #193158"
              style={{
                fontSize: matches ? "20px" : "30px",
                fontFamily: "Regular",
                fontWeight: "900",
                color: "#ffffff",
                textAlign: "center",
                letterSpacing: "5px",
                borderRadius: "20px",
                position: "relative",
                zIndex: 1,
              }}
            >
              Your Statistics
            </Box>

            <TableContainer
              border="10px solid #193158"
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              pt={2}
              pb={5}
              mt={-6}
              className="shadow"
              borderRadius="20px"
              component={Box}
              color="#ffffff"
            >
              <Table
                aria-label="simple table"
                style={{
                  borderRadius: "10px",
                  marginTop: "30px",
                }}
                color="#ffffff"
              >
                <TableHead color="#ffffff">
                  <TableRow style={{ color: "#ffffff" }}>
                    <TableCell
                      align="center"
                      style={{
                        color: "#ffffff",
                        fontSize: matches ? "14px" : "18px",
                        fontFamily: "Nunito",
                      }}
                    >
                      AMOUNT{" "}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        color: "#ffffff",
                        fontSize: matches ? "14px" : "18px",
                        fontFamily: "Nunito",
                      }}
                    >
                      {" "}
                      WITHDRAWAL TIME
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        color: "#ffffff",
                        fontSize: matches ? "14px" : "18px",
                        fontFamily: "Nunito",
                      }}
                    >
                      UNSTAKE{" "}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{
                        color: "#ffffff",
                        fontSize: matches ? "14px" : "18px",
                        fontFamily: "Nunito",
                      }}
                    >
                      {" "}
                      WITHDRAWAL
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakeDetails.length > 0 ? (
                    stakeDetails.map(({ time, amount, withdrawan }, index) => (
                      <TableRow>
                        <TableCell
                          align="center"
                          style={{
                            color: "#ffffff",
                            fontSize: matches ? "14px" : "18px",
                            fontFamily: "Nunito",
                          }}
                        >
                          {amount}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            color: "#ffffff",
                            fontSize: matches ? "14px" : "18px",
                            fontFamily: "Nunito",
                          }}
                        >
                          {moment.unix(time).format("LLL")}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            color: "#ffffff",
                            fontSize: matches ? "14px" : "18px",
                            fontFamily: "Nunito",
                          }}
                        >
                          <button
                            onClick={() => {
                              setunstakeModal(true);
                              setunstakeIndex(index.toString());
                            }}
                            disabled={
                              +time < +moment().format("x") / 1000 || withdrawan
                                ? true
                                : false
                            }
                            style={{
                              background:
                                +time < +moment().format("x") / 1000 ||
                                withdrawan
                                  ? "linear-gradient(0deg, #DFDFDF 0%, #DFDFDF 100%)"
                                  : "linear-gradient(45deg,#02a701, #02a701,#02a701)",
                              fontSize: "16px",
                              borderRadius: "50px",
                              width: "176px",
                              height: "45px",
                              textTransform: "capitalize",
                              fontWeight: "500",
                              fontFamily: "Nunito",
                              borderStyle: "none",
                              color:
                                +time < +moment().format("x") / 1000 ||
                                withdrawan
                                  ? "gray"
                                  : "#ffffff",
                              fontSize: "16px",
                              padding: "10px 35px",
                              border: "2px solid #ffffff",
                              cursor:
                                +time < +moment().format("x") / 1000 ||
                                withdrawan
                                  ? "no-drop"
                                  : "pointer",
                            }}
                          >
                            Unstake
                          </button>
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            color: "#ffffff",
                          }}
                        >
                          <button
                            onClick={() => claimHandler(index.toString())}
                            disabled={
                              +time < +moment().format("x") / 1000 && withdrawan
                                ? true
                                : false
                            }
                            style={{
                              background:
                                +time < +moment().format("x") / 1000 &&
                                !withdrawan
                                  ? "linear-gradient(45deg,#02a701, #02a701,#02a701)"
                                  : "linear-gradient(0deg, #d1d1d1 0%, #d1d1d1 100%)",
                              fontSize: "16px",
                              borderRadius: "50px",
                              width: "176px",
                              height: "45px",
                              textTransform: "capitalize",
                              fontWeight: "500",
                              fontFamily: "Nunito",
                              borderStyle: "none",
                              color:
                                +time < +moment().format("x") / 1000 &&
                                !withdrawan
                                  ? "#ffffff"
                                  : "gray",
                              padding: "10px 35px",
                              border: "2px solid #ffffff",
                              cursor:
                                +time < +moment().format("x") / 1000 &&
                                !withdrawan
                                  ? "pointer"
                                  : "no-drop",
                            }}
                          >
                            Withdraw
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : loading ? (
                    loading
                  ) : (
                    <TableRow>
                      <TableCell
                        align="center"
                        style={{
                          color: "#ffffff",
                          fontSize: matches ? "14px" : "18px",
                          fontFamily: "Nunito",
                          fontFamily: "Nunito",
                        }}
                        colSpan={5}
                      >
                        You have no staking history yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Box>
    </>
  );
}

export default Staking;
