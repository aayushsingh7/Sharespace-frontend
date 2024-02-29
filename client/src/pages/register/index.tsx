import { SIGN_UP } from "@/graphQl/mutations";
import { setUserData } from "@/slice/userSlice";
import bottomNotification from "@/utils/handleBottomNotification";
import { useMutation } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";

interface RegisterProps {
  
}

const Register: FC<RegisterProps> = ({}) => {
  
  const [signUp] = useMutation(SIGN_UP);
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading,setLoading] = useState<boolean>(false)

  const [userInput, setUserInput] = useState({
    username: "",
    password: "",
    name: "",
  });

  const handleInput = (e: any) => {
    setUserInput((old) => {
      return { ...old, [e.target.name]: e.target.value };
    });
  };

  const Register = async () => {
    try {
      setLoading(true)
      const response = await signUp({
        variables: {
          name: userInput.name,
          username: userInput.username,
          password: userInput.password,
        },
      });
      const data = await response.data;
      setLoading(false)
      dispatch(setUserData(data?.signUp))
      router.push("/");
      bottomNotification(dispatch,"Registered successfully")
    } catch (err:any) {
      setLoading(false)
      bottomNotification(dispatch, `${err.message}`);
    }
  };

  return (
    <div className={`w-100vw h-100 flex ai-center jc-center of-hidden`}>
      <div className={`flex ai-center jc-center main-mid-bg-color of-hidden Box-fffj`}>
        <div className={`relative w-100 h-100 img`}>
          <Image
            src="https://res.cloudinary.com/dvk80x6fi/image/upload/c_scale,f_avif,h_590,q_90,w_550/v1700142944/cover_brn1pf.avif"
            alt=""
            className="ofit-cover"
            fill={true}
          />
        </div>

        <div className={`flex ai-center jc-center f-d-c main-mid-bg-color br-10 w-100 oo`}>
          <h2 className="h2 primary-text-color">Register</h2>
          <input
            type="text"
            onChange={handleInput}
            name="name"
            placeholder="Full Name"
            className="btn fs-m-normal dark-bg-color br-10 w-100 primary-text-color"
          />
          <input
            type="text"
            onChange={handleInput}
            name="username"
            placeholder="Username"
            className="btn fs-m-normal dark-bg-color br-10 w-100 primary-text-color"
          />
          <input
            type="text"
            onChange={handleInput}
            name="password"
            placeholder="Password"
            className="btn fs-m-normal dark-bg-color br-10 w-100 primary-text-color"
          />
          <button className="btn fs-m-normal primary-text-color highlight-bg-color br-10 m-t-20 fw-600 c-pointer p-14 w-100" onClick={()=> loading ? null  : Register()}>{loading ? "Registering..." : "Register"}</button>
          

          <p style={{color:"#444444",margin:"30px 0px"}} className={`fs-m-normal`}>------------------ or ------------------</p>

          <Link href={"/login"} style={{ textDecoration: "none" }}>
            <p className="fs-m-normal" style={{color:"#666666"}}>
              Already have an account? <span className="highlight-text-color">login</span>
            </p>
          </Link>
        </div>
      </div>
    </div> 
  );
};

export default Register;
