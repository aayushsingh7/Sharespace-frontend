// import { FC } from "react";
// import styles from "@/styles/UserBtnOptions.module.css";
// import { UserType } from "@/types/types";
// import Link from "next/link";
// import { unFollowUserFunction } from "@/utils/UnFollowUser";
// import { followUserFunction } from "@/utils/FollowUser";
// import { useDispatch } from "react-redux";

// interface UserBtnOptionsProps {
//   loggedInUser: UserType;
//   selectedUser: UserType;
//   userLoading: boolean;
//   isFollowingUser: boolean;
//   getChat: any;
//   unFollowUserMutation: any;
//   followUserMutation: any;
//   socketState: any;
//   token: string;
// }

// const UserBtnOptions: FC<UserBtnOptionsProps> = ({
//   loggedInUser,
//   selectedUser,
//   userLoading,
//   isFollowingUser,
//   getChat,
//   unFollowUserMutation,
//   followUserMutation,
//   socketState,
//   token,
// }) => {
//   const dispatch = useDispatch();
//   return (
//     <div
//       className={`flex ai-center jc-center w-100 m-t-15 ${styles.Button_Options_Container}`}
//     >
//       {loggedInUser.username === selectedUser.username && !userLoading ? (
//         <Link
//           href={"/account/edit/"}
//           style={{ textDecoration: "none", width: "100%" }}
//         >
//           <button
//             className="btn fw-600 primary-text-color dark-mid-bg-color fs-m-small br-10 c-pointer w-100"
//             style={{
//               marginRight: "7px",
//               padding: "10px 20px",
//               marginLeft: "0xp",
//             }}
//           >
//             Edit profile
//           </button>
//         </Link>
//       ) : (
//         <>
//           (
//           <button
//             className={`btn primary-text-color  fw-600  ${
//               isFollowingUser ? "dark-mid-bg-color" : "highlight-bg-color"
//             } fs-m-small br-10 c-pointer w-100`}
//             style={{
//               marginRight: "10px",
//               padding: "10px 20px",
//               marginLeft: "0xp",
//             }}
//             onClick={() =>
//               isFollowingUser
//                 ? unFollowUserFunction(
//                     false,
//                     token,
//                     dispatch,
//                     loggedInUser,
//                     selectedUser,
//                     unFollowUserMutation
//                   )
//                 : followUserFunction(
//                     token,
//                     dispatch,
//                     loggedInUser,
//                     selectedUser,
//                     followUserMutation,
//                     socketState
//                   )
//             }
//           >
//             {isFollowingUser ? "Following" : "Follow"}
//           </button>
//           )
//           <button
//             onClick={getChat}
//             className="btn  primary-text-color  dark-mid-bg-color fs-m-small br-10 c-pointer w-100"
//             style={{
//               marginRight: "7px",
//               padding: "10px 20px",
//               marginLeft: "0xp",
//             }}
//           >
//             Message
//           </button>
//         </>
//       )}
//     </div>
//   );
// };

// export default UserBtnOptions;
