import React, { useContext, useState } from "react";
import { Dialog, DialogContent, Box, Slide } from "@mui/material";
import { AppContext } from "../utils";
import {
  useMinerContract,
  useStakingContract,
} from "../ConnectivityAssets/hooks";
import { toast } from "react-toastify";
import Loading from "../loading";
import { withStyles } from "@mui/styles";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const StyledModal = withStyles(() => ({
  root: {
    "& .MuiDialog-root": {
      zIndex: "1301 !important",
    },
    "&.MuiDialog-container": {
      overflowY: "hidden !important",
    },
    "& .MuiDialog-paperScrollPaper": {
      backgroundColor: "#141e30 !important",
      height: "auto",
      boxShadow: "#141e30 0px 0px 8px 1px",
      border: "5px solid #141e30",
      // borderRadius: "30px !important",
    },
    "& .dialoge__content__section": {
      background: "#141e30 !important",
      // borderRadius: 5,
    },
    "& .MuiDialogContent-root": {
      paddingTop: "20px",
      paddingBottom: "20px",
      position: "relative",
    },
  },
}))(Dialog);

function UnstakeModal({ open, setOpen, unstakeIndex }) {
  const { account, signer } = useContext(AppContext);
  const stakingContract = useStakingContract(signer);
  const [loading, setloading] = useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const unstakeHandler = async () => {
    try {
      setloading(true);
      const tx = await stakingContract.unstake(unstakeIndex);
      await tx.wait();
      toast.success("Success! Amount successfully unsataked.");
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
    <div>
      <Loading loading={loading} />
      <div className="modal__main__container">
        <StyledModal
          open={open}
          keepMounted
          TransitionComponent={Transition}
          onClose={handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogContent className="dialoge__content__section">
            <Box
              textAlign="center"
              fontSize="17px"
              fontFamily="Nunito"
              color="#000000"
            >
              You have to pay 35% potential penality
            </Box>

            <Box
              mt={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <button
                style={{
                  borderRadius: "10px",
                  padding: "15px 20px",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: "19px",
                  fontWeight: "bolder",
                  textTransform: "uppercase",
                  marginRight: "15px",
                  width: "120px",
                  fontFamily: "Nunito",
                  background: "#ffffff",
                  border: "2px solid #000000",
                }}
                onClick={() => handleClose()}
              >
                Cancel
              </button>
              <button
                style={{
                  borderRadius: "10px",
                  padding: "15px 20px",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontSize: "16px",
                  lineHeight: "19px",
                  fontWeight: "bolder",
                  textTransform: "uppercase",
                  marginLeft: "15px",
                  width: "120px",
                  fontFamily: "Nunito",
                  background: "#02a701",
                  border: "2px solid #02a701",
                  color: "#ffffff",
                }}
                onClick={() => {
                  unstakeHandler();
                  handleClose();
                }}
              >
                Unstake
              </button>
            </Box>
          </DialogContent>
        </StyledModal>
      </div>
    </div>
  );
}

export default UnstakeModal;
