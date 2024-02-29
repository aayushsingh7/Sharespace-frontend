import { FC } from "react";

interface ProfileLoadingTemplateProps {}

const ProfileLoadingTemplate: FC<ProfileLoadingTemplateProps> = ({}) => {
  return (
    <>
      <div className="profile-header flex ai-start jc-sb">
        <div className="profile-img loading-template br-100 ofit-cover"></div>
        <div className="profile-userinfo">
          <div className="flex ai-center jc-start profile-userinfo-header">
            <p
              className="loading-template"
              style={{ height: "15px", maxWidth: "180px" }}
            ></p>

            <div
              className="flex ai-center jc-center "
              style={{ marginLeft: "25px" }}
            >
              <button
                className="loading-template loading-btn btn br-10"
                style={{ marginRight: "7px", height: "32px" }}
              ></button>
              <button
                className="loading-template loading-btn btn br-10"
                style={{ height: "32px" }}
              ></button>
            </div>
          </div>

          <div
            className="w-100 flex ai-center jc-sb pppdfdf3"
            style={{ marginTop: "30px", width: "80%" }}
          >
            <p style={{ marginRight: "20px" }} className="loading-template"></p>
            <p style={{ marginRight: "20px" }} className="loading-template"></p>
            <p className="loading-template"></p>
          </div>

          <div
            className="flex ai-start jc-start m-t-20 primary-text-color f-d-c loading-bio"
            style={{ marginBottom: "5px" }}
          >
            <p className="loading-template" style={{ width: "40%" }}></p>
            <p className="loading-template" style={{ width: "50%" }}></p>
            <p className="loading-template" style={{ width: "80%" }}></p>
          </div>
        </div>
      </div>

      <div className="profile-header profile-mob flex ai-start jc-sb ">
        <div className="flex ai-center w-100 jc-sb">
          <div className="profile-img loading-template br-100"></div>

          <div className="flex ai-center jc-end fadfae ">
            <div className="profile-loading-accountinfo pppdfdf3 flex">
              <p
                style={{ marginRight: "20px" }}
                className="loading-template"
              ></p>
              <p
                style={{ marginRight: "20px" }}
                className="loading-template"
              ></p>
              <p className="loading-template"></p>
            </div>
          </div>
        </div>

        <div
          className="loading-bio flex ai-start jc-start m-t-20 primary-text-color f-d-c"
          style={{ width: "100%", marginBottom: "5px" }}
        >
          <p className="loading-template" style={{ width: "40%" }}></p>
          <p className="loading-template"></p>
          <p className="loading-template" style={{ width: "80%" }}></p>
        </div>

        <div className="afjddj flex ai-center jc-center w-100 m-t-10">
          <button
            className="loading-btn loading-template btn br-10"
            style={{ marginRight: "7px" }}
          ></button>
          <button className="loading-btn loading-template btn br-10"></button>
        </div>
      </div>
    </>
  );
};

export default ProfileLoadingTemplate;
