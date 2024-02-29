import { FC, useEffect } from "react";
import styles from "@/styles/Logout.module.css";
import { useMutation } from "@apollo/client";
import { LOGOUT } from "@/graphQl/mutations";
import { useRouter } from "next/router";
import bottomNotification from "@/utils/handleBottomNotification";
import { useDispatch } from "react-redux";

interface LogoutProps {}

const Logout: FC<LogoutProps> = ({}) => {
  const router = useRouter();
  const [logOutUserMutation] = useMutation(LOGOUT);
  const dispatch = useDispatch();

  useEffect(() => {
    logOutUser();
  }, []);

  const logOutUser = async () => {
    try {
      const response = await logOutUserMutation();
      const data = response.data;
      if (data) {
        router.push("/login");
        bottomNotification(dispatch, "Logout successfully");
      } else {
        router.back();
        bottomNotification(dispatch, "Something went wrong while logging out");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
    <div style={{width:"100vw",height:"100vh",background:"black",display:"flex",alignContent:"center",justifyContent:"center"}}>
   
    </div>
    </>
  );
};

export default Logout;
