import { handleViewProfile } from "@/slice/moreSlice";
import { handleOpenSideNav, handleUserSearch } from "@/slice/navbarSlice";
import { UserType } from "@/types/types";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { useDispatch } from "react-redux";

interface UserBoxProps { 
  followBtn: boolean;
  hover?: boolean;
  data?: UserType;
}

const UserBox: FC<UserBoxProps> = ({ followBtn, hover, data }) => {
  const dispatch = useDispatch();

  const handleClicks = (username: any, userId: any) => {
    dispatch(handleViewProfile(true));
    dispatch(handleOpenSideNav(true));
    dispatch(handleUserSearch(false));
  };

  return (
    <Link
      href={`/profile/${data?.username}`}
      style={{ width: "100%", textDecoration: "none" }}
      onClick={() => handleClicks(data?.username, data?.id)}
    >
      <div
        className={`flex ai-center jc-start w-100 p-10 c-pointer ${
          hover ? "hover" : ""
        }`}
      >
        {
          <Image
          prirotiy={true}
          //@ts-ignore
            src={data?.profilePic}
            alt=""
            width={47}
            height={47}
            style={{ minWidth: "47px" }}
            className="of-hidden m-r-15 br-50 ofit-cover"
          
          />
        }

        <div className="flex ai-center jc-sb w-100">
          <div className="flex ai-start jc-start f-d-c primary-text-color">
            <h4 className="primary-text-color">{data?.username}</h4>
            <p
              className="secondary-text-color fs-small"
              style={{ marginTop: "4px" }}
            >
              {data?.name}
            </p>
          </div>
          {followBtn ? (
            <button className="wow btn bg-none highlight-text-color c-pointer">
              Follow
            </button>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default UserBox;
