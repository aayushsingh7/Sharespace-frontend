import { handleShowMoreOptions } from "@/slice/moreSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/MoreOptions.module.css";
import bottomNotification from "@/utils/handleBottomNotification";
import Link from "next/link";
import { FC } from "react";
import { AiOutlineLink, AiOutlineMinus } from "react-icons/ai";
import { FaRegBookmark } from "react-icons/fa";
import { MdLogout, MdOutlineVerified } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";

interface MoreOptionsProps {}

const MoreOptions: FC<MoreOptionsProps> = ({}) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);

  const copyTextToClipboard = () => {
    navigator.clipboard
      .writeText(`http://localhost:3000/profile/${loggedInUser.username}`)
      .catch((error) => {
        window.alert("something went wrong")
      });
  };

  return (
   
        <div
          className={`w-100 h-100 ai-center jc-center fixed top-0 left-0 of-hidden zi-1000 ${styles.show}`}
        >
          <div
            className={`w-100 h-100 absolute left-0 top-0 ${styles.show_bg}`}
            onClick={() => dispatch(handleShowMoreOptions(false))}
          ></div>

          <div
            className={`w-100 dark-bg-color absolute bottom-0 left-0 ${styles.options_container} ${styles.show_con}`}
          >
            <div className={styles.Header}>
              <AiOutlineMinus style={{ fontSize: "40px", color: "white" }} />
            </div>

            <Link
              href={"/saved"}
              style={{ width: "100%", textDecoration: "none" }}
              onClick={() => dispatch(handleShowMoreOptions(false))}
            >
              <div className={`flex ai-center jc-start ${styles.options}`} style={{padding:"16px"}}>
                <FaRegBookmark
                  style={{ fontSize: "23px", marginLeft: "3px" }}
                />
                <p>Saved</p>
              </div>
            </Link>

            <div
              className={`flex ai-center jc-start ${styles.options}`} style={{padding:"16px"}}
              onClick={() => {
                dispatch(handleShowMoreOptions(false));
                bottomNotification(dispatch, "Link copied");
                copyTextToClipboard();
              }}
            >
              <AiOutlineLink />
              <p>Copy profile link</p>
            </div>

            <div className={`flex ai-center jc-start ${styles.options}`} style={{padding:"16px"}}>
              <MdOutlineVerified style={{ fontSize: "25px", color: "white" }} />
              <p className={styles.dsd}>
                ShareSpace Verified <span>comming soon</span>
              </p>
            </div>

            <Link
              style={{ width: "100%", textDecoration: "none" }}
              href={"/logout"}
              onClick={() => dispatch(handleShowMoreOptions(false))}
            >
              <div className={`flex ai-center jc-start ${styles.options}`} style={{padding:"16px"}}>
                <MdLogout style={{ color: "red" }} />
                <p style={{ color: "red" }}>Logout</p>
              </div>
            </Link>
          </div>
        </div>
  );
};

export default MoreOptions;
