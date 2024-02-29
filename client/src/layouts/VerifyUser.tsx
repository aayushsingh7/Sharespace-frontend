import { LOGGED_IN_USER } from "@/graphQl/queries";
import { handleVerification, setUserData } from "@/slice/userSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/VerifyUser.module.css";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { FaSlideshare } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

interface VerifyUserProps {}

const VerifyUser: FC<VerifyUserProps> = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isVerifying = useSelector((state: RootState) => state.user.isVerifying);


  const { loading, data, error, refetch } = useQuery(LOGGED_IN_USER);
  console.log(router.asPath);

  useEffect(() => {
   
    if (data?.loggedInUser && !loading) {
      dispatch(setUserData(data?.loggedInUser));
      dispatch(handleVerification(false));
    } else if (!data?.loggedInUser && !loading) {
      router.push("/login");
    }
  }, [loading]);

  useEffect(() => {
    if (router.asPath === "/login") {
      dispatch(handleVerification(false));
    }
  }, [router.asPath]);

  return (
    <div
      className={
        isVerifying
          ? `${styles.Container} ${styles.active}`
          : `${styles.Container} ${styles.disabled}`
      }
    >
      <FaSlideshare style={{ color: "aquamarine", fontSize: "100px" }} />
    </div>
  );
};

export default VerifyUser;
