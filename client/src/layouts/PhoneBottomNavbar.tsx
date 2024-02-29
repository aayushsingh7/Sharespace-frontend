import { handleViewProfile } from "@/slice/moreSlice";
import { handleOpenCreatePost } from "@/slice/postSlice";
import { RootState } from "@/store/store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";
import { BiMoviePlay, BiSolidMoviePlay } from "react-icons/bi";
import { BsSend, BsSendFill } from "react-icons/bs";
import { GoHome, GoHomeFill } from "react-icons/go";
import { IoIosAddCircle, IoIosAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";

interface PhoneBottomNavbarProps {}

const PhoneBottomNavbar: FC<PhoneBottomNavbarProps> = ({}) => {
  const openChat = useSelector((state: RootState) => state.chat.openChat);
  const router = useRouter();
  const dispatch = useDispatch();
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const unSeenChats:any[] = useSelector((state:RootState)=> state.chat.unSeenChatsNotification)

  const handleClick = (username: string, userId: string) => {
    dispatch(handleViewProfile(true));
    router.push(`/profile/${username}`);
  };

  return (
    <div
      className={
        router.asPath.startsWith("/reels/") ||
        router.asPath.startsWith("/account/edit") ||
        (router.asPath.startsWith("/direct/inbox") && openChat) 
        // router.asPath.startsWith("/stories/")
          ? `w-100 ai-center jc-sb fixed bottom-0 left-0 main-bg-color primary-text-color zi-100 bottom-navbar-container b-n-hide`
          : `w-100 ai-center jc-sb fixed bottom-0 left-0 main-bg-color primary-text-color zi-100  bottom-navbar-container`
      }
    >
      <Link href="/" style={{ textDecoration: "none", color: "white" }}>
        {router.asPath === "/" ? (
          <GoHomeFill style={{ fontSize: "30px" }} />
        ) : (
          <GoHome style={{ fontSize: "30px" }} />
        )}
      </Link>
      <Link href="/reels" style={{ textDecoration: "none", color: "white" }}>
        {" "}
        {router.asPath.startsWith("/reels") ? (
          <BiSolidMoviePlay style={{ fontSize: "30px" }} />
        ) : (
          <BiMoviePlay style={{ fontSize: "30px" }} />
        )}
      </Link>
      <div onClick={() => dispatch(handleOpenCreatePost(true))}>
        {router.asPath.startsWith("/create") ? (
          <IoIosAddCircle style={{ fontSize: "30px" }} />
        ) : (
          <IoIosAddCircleOutline style={{ fontSize: "30px" }} />
        )}
      </div>

      <Link
        href="/direct/inbox"
        style={{ textDecoration: "none", color: "white",position:"relative" }}
      >
        {unSeenChats.length <= 0 ? null : <span className="br-50 flex ai-center jc-center primary-text-color absolute bottom-navbar-container-notification">{unSeenChats.length}</span>}
        {" "}
        {router.asPath.startsWith("/messages") ? (
          <BsSendFill style={{ fontSize: "25px" }} />
        ) : (
          <BsSend style={{ fontSize: "25px" }} />
        )}
      </Link>

      <Image
        src={loggedInUser.profilePic}
        alt="pp"
        width={35}
        height={35}
        className="br-50-per"
        onClick={() => handleClick(loggedInUser.username, loggedInUser.id)}
      />
    </div>
  );
};

export default PhoneBottomNavbar;
