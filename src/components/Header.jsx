import React, { useContext } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { AppContext } from "../utils";
import logo from "../images/logo.png";
import { Typography, useMediaQuery } from "@mui/material";
import { match } from "assert";

export default function Header() {
  const { account, connect, disconnect } = useContext(AppContext);
  const matches = useMediaQuery("(max-width:700px)");

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="relative"
        zIndex={1}
        style={{
          background: "transparent",
        }}
        height="92px"
        width="100%"
      >
        <Container maxWidth="xl">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {/* <a
              href="https://spaceinu.info/"
              target="_blank"
              style={{ textDecoration: "none" }}
            > */}
            <Box display="flex" alignItems="center">
              <img width={matches ? "70px" : "100px"} src={logo} alt="" />
            </Box>
            {/* </a> */}

            {account ? (
              <Box
                width={matches ? "110px" : "130px"}
                height={matches ? "35px" : "42px"}
                bgcolor="#02a701"
                border="2px solid #ffffff"
                borderRadius="100px"
                sx={{ cursor: "pointer" }}
                display="flex"
                justifyContent="center"
                alignItems="center"
                fontFamily="Nunito"
                color="#ffffff"
                fontWeight="600"
                fontSize="20px"
                onClick={() => disconnect()}
                style={{ zIndex: 1 }}
              >
                {account.slice(0, 4) + "..." + account.slice(-4)}
              </Box>
            ) : (
              <Box
                zIndex={1}
                style={{
                  cursor: "pointer",
                }}
                bgcolor="#02a701"
                border="2px solid #ffffff"
                width={matches ? "110px" : "130px"}
                height={matches ? "35px" : "42px"}
                fontWeight="600"
                borderRadius="100px"
                fontSize="18px"
                color="#ffffff"
                fontFamily="Regular"
                display="flex"
                justifyContent="center"
                alignItems="center"
                onClick={() => connect()}
              >
                Connect
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
}
