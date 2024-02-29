import { EDIT_PROFILE } from "@/graphQl/mutations";
import { handleLoadingTask } from "@/slice/moreSlice";
import { setUserData } from "@/slice/userSlice";
import { RootState } from "@/store/store";
import styles from "@/styles/EditProfile.module.css";
import bottomNotification from "@/utils/handleBottomNotification";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";

interface EditProfileProps {}

const EditProfile: FC<EditProfileProps> = ({}) => {
  const router = useRouter();
  const [privateAcc, setPrivateAcc] = useState(false);
  const loggedInUser = useSelector((state: RootState) => state.user.user);
  const [newProfilePic, setNewProfilePic] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [editProfileMutation] = useMutation(EDIT_PROFILE);
  const dispatch = useDispatch();

  const [profileData, setProfileData] = useState({
    name: "",
    link: "",
    bio: "",
    gender: "",
    accountType: "",
  });

  useEffect(() => {
    setProfileData((old) => {
      return { ...old, ...loggedInUser };
    });
    if (loggedInUser.accountType === "public") {
      setPrivateAcc(false);
    } else if (loggedInUser.accountType === "private") {
      setPrivateAcc(true);
    }
  }, []);

  const handleEditProfile = async () => {
    try {
      dispatch(handleLoadingTask(true));
      const name =
        profileData.name === loggedInUser.name
          ? loggedInUser.name
          : profileData.name;
      const profilePic = newProfilePic
        ? newProfilePic
        : loggedInUser.profilePic;
      const bio =
        profileData.bio === loggedInUser.bio
          ? loggedInUser.bio
          : profileData.bio;
      const link =
        profileData.link === loggedInUser.link
          ? loggedInUser.link
          : profileData.link;
      const gender =
        profileData.gender === loggedInUser.gender
          ? loggedInUser.gender
          : profileData.gender;
      const accountType =
        profileData.accountType === loggedInUser.accountType
          ? loggedInUser.accountType
          : privateAcc
          ? "private"
          : "public";

     
      const response = await editProfileMutation({
        variables: {
          userId: loggedInUser.id,
          name: name,
          profilePic: uploadedFile,
          bio: bio,
          link: link,
          gender: gender,
          accountType: accountType,
        },
      });

      let data = await response.data;

      dispatch(setUserData(data.editProfile));
      bottomNotification(dispatch,"Profile updated")
      dispatch(handleLoadingTask(false));
    } catch (err) {
      bottomNotification(dispatch,"Cannot update profile at this moment, try again later")
    }
  };

  const handleUserInput = (e: any) => {
    setProfileData((old) => {
      return { ...old, [e.target.name]: e.target.value };
    });
  };

  const handleProfilePicUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setUploadedFile(reader.result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className={`w-100 h-100 of-y-scroll flex ai-start jc-center ${styles.Container}`}>
      <div className={styles.Accounts_Details_Container}>
        <div className={styles.edit_head_page}>
          <p className="primary-text-color" style={{fontSize:"1.6rem"}}>Edit profile</p>
          <AiOutlineClose
            style={{ fontSize: "26px", color: "white" }}
            onClick={() => router.back()}
          />
        </div>
        <div className={styles.Accounts_Details}>
          <div className={`flex ai-center jc-start w-100 m-30`} >
           <div className={`relative br-50 ${styles.img_con}`} >
           <Image
              src={`${uploadedFile ? uploadedFile : loggedInUser.profilePic}`}
              fill={true}
              alt="profile pic"
              className="br-50"
            />
           </div>
            <div className="flex ai-start jc-start f-d-c w-100">
              <p className={`primary-text-color ${styles.dddd}`}>_aayush.07_</p>
              <input
                type="file"
                onChange={handleProfilePicUpload}
                id="profilePic"
                style={{ display: "none" }}
              />
              <label htmlFor="profilePic" style={{ marginTop: "6px" }}>
                <span className="highlight-text-color c-pointer fw-600 fs-m-small">Change profile picture</span>
              </label>
            </div>
          </div>

          <div className={`flex ai-center jc-start w-100 m-30 ${styles.Mob_row}`}>
            <p className={`fs-m-normal primary-text-color ${styles.h_H}`} style={{ marginRight: "70px" }}>
              Name
            </p>
            <div className="flex ai-start jc-start f-d-c w-100">
              <input
                className="btn fs-m-normal primary-text-color w-100  b-extra-light p-13 bg-none"
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleUserInput}
              />
            </div>
          </div>

          <div className={`flex ai-center jc-start w-100 m-30 ${styles.Mob_row}`}>
            <p className={`fs-m-normal primary-text-color ${styles.h_H}`} style={{ marginRight: "70px" }}>
              Email
            </p>
            <div className="flex ai-start jc-start f-d-c w-100">
              <input
               className="btn fs-m-normal primary-text-color w-100  b-extra-light p-13 bg-none"
                type="text"
                name="email"
                value={"aayush*******@gmail.com"}
                readOnly
              />
            </div>
          </div>

          <div className={`flex ai-center jc-start w-100 m-30 ${styles.Mob_row}`}>
            <p
              className={`fs-m-normal primary-text-color ${styles.h_H} ${styles.m}`}
              style={{ marginRight: "55px"}}
            >
              Website
            </p>

            <div className="flex ai-start jc-start f-d-c w-100">
              <input
               className="btn fs-m-normal primary-text-color w-100  b-extra-light p-13 bg-none"
                type="text"
                placeholder="Enter website link"
                name="link"
                onChange={handleUserInput}
              />
              <span className="fs-small m-t-10 light-text-color">
                Add any website link u want people to visit from your profile
              </span>
            </div>
          </div>

          <div
            className={`flex ai-center jc-start w-100 m-30 ${styles.Mob_row}`}
            style={{ alignItems: "flex-start" }}
          >
            <p className={`fs-m-normal primary-text-color ${styles.h_H}`} style={{ marginRight: "90px" }}>
              Bio
            </p>
            <div className="flex ai-start jc-start f-d-c w-100">
              <textarea
               className="btn fs-m-normal primary-text-color w-100  b-extra-light p-13 bg-none h-200 f-f-m" style={{resize:"none"}}
                name="bio"
                id=""
                placeholder="Tell people more about yourself"
                onChange={handleUserInput}
              ></textarea>
            </div>
          </div>

          <div className={`flex ai-center jc-start w-100 m-30 ${styles.Mob_row}`}>
            <div style={{ marginRight: "60px" }} className={styles.m_row}>
              <p className={`fs-m-normal primary-text-color ${styles.h_H}`}>Account</p>
              <p
                className={`fs-m-normal primary-text-color ${styles.h_H} ${styles.n}`}
                style={{ marginTop: "5px" }}
              >
                Visibility
              </p>
            </div>
            <div className={`flex ai-start jc-start f-d-c w-100 ${styles.acc_v}`}>
              <p
                className={
                  privateAcc ? `${styles.unSelected}` : `${styles.selected}`
                }
                onClick={() => {
                  setPrivateAcc(false);
                  setProfileData((old) => {
                    return { ...old, accountType: "public" };
                  });
                }}
                style={{ marginRight: "20px" }}
              >
                Public
              </p>
              <p
                className={
                  privateAcc ? `${styles.selected}` : `${styles.unSelected}`
                }
                onClick={() => {
                  setPrivateAcc(true);
                  setProfileData((old) => {
                    return { ...old, accountType: "private" };
                  });
                }}
              >
                Private
              </p>
            </div>
          </div>

          <div className={`flex ai-center jc-start w-100 m-30 ${styles.Mob_row}`}>
            <p
              className={`fs-m-normal primary-text-color ${styles.h_H} ${styles.ff}`}
              style={{ marginRight: "60px", marginBottom: "25px" }}
            >
              Gender
            </p>
            <div className="flex ai-start jc-start f-d-c w-100">
              <input
               className="btn fs-m-normal primary-text-color w-100  b-extra-light p-13 bg-none"
                type="text"
                placeholder="Enter your gender"
                name="gender"
                defaultValue="Prefer not to say"
                onChange={handleUserInput}
              />
              <span className="fs-small m-t-10 light-text-color">
                This won’t be part of your public profile.
              </span>
            </div>
          </div>

          <div className={`flex ai-center jc-start w-100 m-30`}>
            <p
              className={`fs-m-normal primary-text-color ${styles.h_H} ${styles.no}`}
              style={{
                marginRight: "60px",
                marginBottom: "25px",
                color: "black",
              }}
            >
              Submit
            </p>
            <div className="flex ai-start jc-start f-d-c w-100">
              <button
                className={`btn primary-text-color highlight-bg-color c-pointer fs-m-normal ${styles.Submit_Button}`}
                style={{marginTop:"6px",padding:"12px 25px",borderRadius:"5px"}}
                onClick={handleEditProfile}
              >
                Submit
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
